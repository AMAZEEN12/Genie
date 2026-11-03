package ng.tesa.genie.receipt;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import ng.tesa.genie.auth.CurrentUser;
import ng.tesa.genie.auth.Role;
import ng.tesa.genie.common.ConflictException;
import ng.tesa.genie.common.ErrorCode;
import ng.tesa.genie.common.ForbiddenException;
import ng.tesa.genie.common.NotFoundException;
import ng.tesa.genie.config.AppProperties;

@Service
public class ReceiptService {

    private static final Logger log = LoggerFactory.getLogger(ReceiptService.class);

    private final ReceiptRepository repository;
    private final FileValidationService fileValidationService;
    private final CloudinaryStorageService storageService;
    private final UploadRateLimiter rateLimiter;
    private final AppProperties properties;

    public ReceiptService(ReceiptRepository repository,
                          FileValidationService fileValidationService,
                          CloudinaryStorageService storageService,
                          UploadRateLimiter rateLimiter,
                          AppProperties properties) {
        this.repository = repository;
        this.fileValidationService = fileValidationService;
        this.storageService = storageService;
        this.rateLimiter = rateLimiter;
        this.properties = properties;
    }

    @Transactional
    public ReceiptResponse uploadReceipt(CurrentUser user, String clientIp, MultipartFile file) {
        if (user.role() == Role.EMPLOYEE) {
            throw new ForbiddenException(ErrorCode.FORBIDDEN, "Employees cannot upload receipts.");
        }

        // 1. Rate limiting per user and per IP
        rateLimiter.checkRateLimit(user.id(), clientIp);

        // 2. Validate bytes, size cap 10MB, allowed types (JPEG, PNG, WebP, PDF), and strip EXIF
        FileValidationService.ValidatedFile validated = fileValidationService.validateAndSanitize(file);

        // 3. Folder constructed by server (never accept folder from client)
        String baseFolder = (properties.cloudinary() != null && properties.cloudinary().folder() != null)
                ? properties.cloudinary().folder()
                : "genie/receipts";
        String serverFolder = baseFolder + "/" + user.orgId();

        // 4. Upload to Cloudinary with authenticated delivery type
        CloudinaryStorageService.UploadResult uploaded = storageService.upload(
                validated.bytes(),
                serverFolder,
                validated.detectedFormat(),
                validated.resourceType()
        );

        // 5. Save receipt record in database
        Receipt receipt = new Receipt(
                UUID.randomUUID(),
                user.orgId(),
                user.id(),
                user.managerId(),
                uploaded.publicId(),
                uploaded.resourceType(),
                uploaded.format(),
                ReceiptStatus.SUBMITTED,
                validated.originalFilename(),
                validated.bytes().length,
                Instant.now(),
                null,
                null,
                null,
                null,
                1
        );

        Receipt saved = repository.insert(receipt);
        // Persist file bytes in database fallback store (R34) so restarts never lose files
        repository.saveFileBytes(saved.id(), validated.bytes(), validated.resourceType());
        repository.logAudit(saved.id(), saved.orgId(), user.id(), "UPLOAD", "Receipt uploaded: " + saved.originalName());

        // Return only our own receipt ID, never Cloudinary public_id or URL
        return ReceiptResponse.from(saved);
    }

    public Receipt checkViewAccess(CurrentUser user, UUID receiptId) {
        Receipt r = repository.findById(receiptId)
                .orElseThrow(() -> new NotFoundException("Receipt not found."));

        // 1. Same organisation first
        if (!r.orgId().equals(user.orgId())) {
            throw new NotFoundException("Receipt not found.");
        }

        // 2. Role and relationship
        switch (user.role()) {
            case TECHNICIAN -> {
                if (!r.uploadedBy().equals(user.id())) {
                    throw new NotFoundException("Receipt not found.");
                }
            }
            case MANAGER -> {
                boolean isOwn = r.uploadedBy().equals(user.id());
                boolean isDirectReport = user.id().equals(r.managerId());
                if (!isOwn && !isDirectReport) {
                    throw new NotFoundException("Receipt not found.");
                }
            }
            case FINANCE -> {
                // All in the organisation allowed
            }
            default -> throw new NotFoundException("Receipt not found.");
        }

        return r;
    }

    public ReceiptResponse getReceipt(CurrentUser user, UUID receiptId) {
        Receipt r = checkViewAccess(user, receiptId);
        return ReceiptResponse.from(r);
    }

    public List<ReceiptResponse> listReceipts(CurrentUser user) {
        List<Receipt> list = switch (user.role()) {
            case TECHNICIAN -> repository.findByUploader(user.id());
            case MANAGER -> repository.findByManagerTeam(user.orgId(), user.id());
            case FINANCE -> repository.findByOrg(user.orgId());
            default -> List.of();
        };
        return list.stream().map(ReceiptResponse::from).toList();
    }

    public record ReceiptStreamResult(
            InputStream stream,
            String contentType,
            String filename,
            long length
    ) {
    }

    public ReceiptStreamResult getReceiptFile(CurrentUser user, UUID receiptId) {
        Receipt r = checkViewAccess(user, receiptId);

        InputStream stream = null;
        if (storageService.isConfigured()) {
            try {
                stream = storageService.downloadStream(r.publicId(), r.resourceType(), r.format());
            } catch (Exception e) {
                log.warn("Cloudinary stream failed for receipt {}, checking database fallback: {}", r.id(), e.getMessage());
            }
        }

        // Database persistent fallback (persists across container restarts and sleep cycles)
        if (stream == null) {
            byte[] dbBytes = repository.findFileBytes(r.id()).orElse(null);
            if (dbBytes != null) {
                stream = new ByteArrayInputStream(dbBytes);
            }
        }

        // In-memory fallback (for offline test runs or unconfigured environments)
        if (stream == null && !storageService.isConfigured()) {
            try {
                stream = storageService.downloadStream(r.publicId(), r.resourceType(), r.format());
            } catch (Exception ignored) {
            }
        }

        if (stream == null) {
            throw new NotFoundException("Stored receipt file not found.");
        }

        repository.logAudit(r.id(), r.orgId(), user.id(), "VIEW", "Receipt file viewed: " + r.originalName());

        String contentType = switch (r.format().toLowerCase()) {
            case "pdf" -> "application/pdf";
            case "png" -> "image/png";
            case "webp" -> "image/webp";
            default -> "image/jpeg";
        };

        return new ReceiptStreamResult(stream, contentType, r.originalName(), r.bytes());
    }

    @Transactional
    public ReceiptResponse decideReceipt(CurrentUser user, UUID receiptId, ReceiptStatus decision) {
        if (user.role() != Role.MANAGER) {
            throw new ForbiddenException(ErrorCode.FORBIDDEN, "Only managers can approve or reject receipts.");
        }

        Receipt r = repository.findById(receiptId)
                .orElseThrow(() -> new NotFoundException("Receipt not found."));

        if (!r.orgId().equals(user.orgId())) {
            throw new NotFoundException("Receipt not found.");
        }

        // Manager approves their own receipt -> 403
        if (r.uploadedBy().equals(user.id())) {
            throw new ForbiddenException(ErrorCode.SELF_APPROVAL, "Managers cannot approve their own receipts.");
        }

        // Direct reports' only -> if not direct report, return 404
        if (!user.id().equals(r.managerId())) {
            throw new NotFoundException("Receipt not found.");
        }

        if (decision != ReceiptStatus.APPROVED && decision != ReceiptStatus.REJECTED) {
            throw new ConflictException(ErrorCode.RECEIPT_INVALID_TRANSITION,
                    "Decision must be approved or rejected.");
        }

        if (r.status() != ReceiptStatus.SUBMITTED) {
            throw new ConflictException(ErrorCode.RECEIPT_INVALID_TRANSITION,
                    "Receipt cannot be decided from status " + r.status().value());
        }

        Instant now = Instant.now();
        boolean updated = repository.updateDecision(r.id(), r.version(), decision, user.id(), now);
        if (!updated) {
            throw new ConflictException(ErrorCode.RECEIPT_INVALID_TRANSITION, "Concurrent modification on receipt.");
        }

        repository.logAudit(r.id(), r.orgId(), user.id(), "DECISION", "Status changed to " + decision.value());
        return ReceiptResponse.from(repository.findById(r.id()).orElseThrow());
    }

    @Transactional
    public ReceiptResponse reimburseReceipt(CurrentUser user, UUID receiptId) {
        if (user.role() != Role.FINANCE) {
            throw new ForbiddenException(ErrorCode.FORBIDDEN, "Only finance can mark receipts as reimbursed.");
        }

        Receipt r = repository.findById(receiptId)
                .orElseThrow(() -> new NotFoundException("Receipt not found."));

        if (!r.orgId().equals(user.orgId())) {
            throw new NotFoundException("Receipt not found.");
        }

        if (r.status() != ReceiptStatus.APPROVED) {
            throw new ConflictException(ErrorCode.RECEIPT_NOT_APPROVED,
                    "Only approved receipts can be reimbursed. Current status: " + r.status().value());
        }

        Instant now = Instant.now();
        boolean updated = repository.updateReimbursed(r.id(), r.version(), user.id(), now);
        if (!updated) {
            throw new ConflictException(ErrorCode.RECEIPT_INVALID_TRANSITION, "Concurrent modification on receipt.");
        }

        repository.logAudit(r.id(), r.orgId(), user.id(), "REIMBURSE", "Receipt marked as reimbursed");
        return ReceiptResponse.from(repository.findById(r.id()).orElseThrow());
    }

    @Transactional
    public void deleteReceipt(CurrentUser user, UUID receiptId) {
        Receipt r = repository.findById(receiptId)
                .orElseThrow(() -> new NotFoundException("Receipt not found."));

        if (!r.orgId().equals(user.orgId())) {
            throw new NotFoundException("Receipt not found.");
        }

        if (user.role() == Role.FINANCE) {
            // Finance can delete any receipt in the organisation (logged)
        } else if (r.uploadedBy().equals(user.id())) {
            // Uploader while still submitted
            if (r.status() != ReceiptStatus.SUBMITTED) {
                throw new ForbiddenException(ErrorCode.FORBIDDEN,
                        "Receipts can only be deleted while still submitted.");
            }
        } else {
            throw new NotFoundException("Receipt not found.");
        }

        storageService.delete(r.publicId(), r.resourceType());
        repository.deleteById(r.id());
        repository.logAudit(r.id(), r.orgId(), user.id(), "DELETE", "Receipt deleted by " + user.displayName());
    }
}
