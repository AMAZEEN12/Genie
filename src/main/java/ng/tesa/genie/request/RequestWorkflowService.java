package ng.tesa.genie.request;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.LocalDate;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ng.tesa.genie.auth.CurrentUser;
import ng.tesa.genie.auth.Role;
import ng.tesa.genie.common.ConflictException;
import ng.tesa.genie.common.ErrorCode;
import ng.tesa.genie.common.ForbiddenException;
import ng.tesa.genie.common.IdempotencyKeyReusedException;
import ng.tesa.genie.common.NotFoundException;
import ng.tesa.genie.estimate.Estimate;
import ng.tesa.genie.estimate.EstimateLine;
import ng.tesa.genie.estimate.EstimateRepository;

@Service
public class RequestWorkflowService {

    private final RequestRepository requests;
    private final HistoryRepository history;
    private final EstimateRepository estimates;

    public RequestWorkflowService(RequestRepository requests, HistoryRepository history,
                                  EstimateRepository estimates) {
        this.requests = requests;
        this.history = history;
        this.estimates = estimates;
    }

    public static String computeHash(String title, String description, String building,
                                     String location, String equipment, String category, String priority) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            String raw = String.join("|", title, description, building, location, equipment, category, priority);
            byte[] hash = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }

    private static String generateReference() {
        int randomSuffix = ThreadLocalRandom.current().nextInt(1000, 9999);
        return "REQ-" + System.currentTimeMillis() % 1000000 + "-" + randomSuffix;
    }

    public MaintenanceRequest getRequestWithDetails(UUID id) {
        MaintenanceRequest req = requests.findById(id)
                .orElseThrow(() -> new NotFoundException("Maintenance request not found: " + id));
        var estList = estimates.findByRequestId(id);
        var histList = history.findByRequestId(id);
        return req.withEstimatesAndHistory(estList, histList);
    }

    @Transactional
    public MaintenanceRequest createRequest(String title, String description, String building,
                                           String location, String equipment, String category,
                                           String priority, UUID idempotencyKey, CurrentUser reportedBy) {
        String hash = computeHash(title, description, building, location, equipment, category, priority);

        var existing = requests.findByIdempotencyKey(idempotencyKey);
        if (existing.isPresent()) {
            MaintenanceRequest req = existing.get();
            if (!req.requestHash().equals(hash)) {
                throw new IdempotencyKeyReusedException(
                        "Idempotency-Key has already been used with different request parameters.");
            }
            return getRequestWithDetails(req.id());
        }

        String reference = generateReference();
        UUID id = requests.insert(reference, idempotencyKey, hash, title, description,
                building, location, equipment, category, priority, reportedBy.id());

        history.append(id, null, "REPORTED", reportedBy.id(), "Fault reported");

        return getRequestWithDetails(id);
    }

    @Transactional
    public MaintenanceRequest assignTechnician(UUID requestId, UUID technicianId, Instant deadline,
                                              int version, CurrentUser manager) {
        MaintenanceRequest req = requests.findById(requestId)
                .orElseThrow(() -> new NotFoundException("Maintenance request not found: " + requestId));

        int rows = requests.assignTechnician(requestId, technicianId, deadline, manager.id(), version);
        if (rows == 0) {
            MaintenanceRequest current = requests.findById(requestId).orElse(req);
            if (!"REPORTED".equals(current.status())) {
                throw new ConflictException(ErrorCode.ALREADY_ASSIGNED,
                        "Request has already been assigned (status is " + current.status() + ").");
            }
            if (current.version() != version) {
                throw new ConflictException(ErrorCode.ALREADY_ASSIGNED,
                        "Request was updated concurrently (version is " + current.version() + ", expected " + version + ").");
            }
            throw new ConflictException(ErrorCode.ALREADY_ASSIGNED, "Could not assign request.");
        }

        history.append(requestId, "REPORTED", "ASSIGNED", manager.id(), "Assigned to technician");
        return getRequestWithDetails(requestId);
    }

    @Transactional
    public Estimate submitEstimate(UUID requestId, long amountKobo, List<EstimateLine> lines, CurrentUser technician) {
        // MVP feedback item 6: a breakdown must add up to the total. The deferred V5 trigger
        // estimate_lines_match_total enforces the same rule in the database at commit.
        if (!lines.isEmpty()) {
            long sum = lines.stream().mapToLong(EstimateLine::amountKobo).reduce(0L, Math::addExact);
            if (sum != amountKobo) {
                throw new ConflictException(ErrorCode.VALIDATION_FAILED,
                        "amountKobo (" + amountKobo + ") must equal the sum of the lines (" + sum + ").");
            }
        }

        MaintenanceRequest req = requests.findById(requestId)
                .orElseThrow(() -> new NotFoundException("Maintenance request not found: " + requestId));

        if (req.technician() == null || !req.technician().id().equals(technician.id())) {
            throw new ForbiddenException(ErrorCode.FORBIDDEN,
                    "Only the assigned technician may submit an estimate for this request.");
        }

        if (!"ASSIGNED".equals(req.status())) {
            throw new ConflictException(ErrorCode.INVALID_TRANSITION,
                    "Estimates can only be submitted when request status is ASSIGNED (current: " + req.status() + ").");
        }

        UUID estimateId = estimates.insert(requestId, amountKobo, technician.id());
        estimates.insertLines(estimateId, lines);
        requests.updateStatus(requestId, "ESTIMATE_SUBMITTED");
        history.append(requestId, "ASSIGNED", "ESTIMATE_SUBMITTED", technician.id(),
                "Estimate submitted: " + amountKobo + " kobo"
                        + (lines.isEmpty() ? "" : " (" + lines.size() + (lines.size() == 1 ? " line)" : " lines)")));

        return estimates.findById(estimateId).orElseThrow();
    }

    @Transactional
    public Estimate decideEstimate(UUID estimateId, String decision, String reason, CurrentUser finance) {
        Estimate estimate = estimates.findById(estimateId)
                .orElseThrow(() -> new NotFoundException("Estimate not found: " + estimateId));

        if (estimate.submittedBy().id().equals(finance.id())) {
            throw new ForbiddenException(ErrorCode.SELF_APPROVAL,
                    "Finance users cannot approve or reject an estimate they submitted.");
        }

        int rows = estimates.recordDecision(estimateId, decision, reason, finance.id());
        if (rows == 0) {
            throw new ConflictException(ErrorCode.ALREADY_DECIDED, "This estimate has already been decided.");
        }

        if ("APPROVED".equalsIgnoreCase(decision)) {
            requests.updateStatus(estimate.requestId(), "ESTIMATE_APPROVED");
            history.append(estimate.requestId(), "ESTIMATE_SUBMITTED", "ESTIMATE_APPROVED",
                    finance.id(), "Estimate approved");
        } else if ("REJECTED".equalsIgnoreCase(decision)) {
            requests.updateStatus(estimate.requestId(), "ASSIGNED");
            history.append(estimate.requestId(), "ESTIMATE_SUBMITTED", "ASSIGNED",
                    finance.id(), "Estimate rejected" + (reason != null ? ": " + reason : ""));
        } else {
            throw new ConflictException(ErrorCode.VALIDATION_FAILED, "Invalid decision: " + decision);
        }

        return estimates.findById(estimateId).orElseThrow();
    }

    @Transactional
    public MaintenanceRequest startWork(UUID requestId, CurrentUser technician) {
        MaintenanceRequest req = requests.findById(requestId)
                .orElseThrow(() -> new NotFoundException("Maintenance request not found: " + requestId));

        if (req.technician() == null || !req.technician().id().equals(technician.id())) {
            throw new ForbiddenException(ErrorCode.FORBIDDEN,
                    "Only the assigned technician may start work on this request.");
        }

        int rows = requests.startWork(requestId, technician.id());
        if (rows == 0) {
            throw new ConflictException(ErrorCode.ESTIMATE_NOT_APPROVED,
                    "Work cannot start without an approved estimate (current status: " + req.status() + ").");
        }

        history.append(requestId, "ESTIMATE_APPROVED", "IN_PROGRESS", technician.id(), "Work started");
        return getRequestWithDetails(requestId);
    }

    @Transactional
    public MaintenanceRequest startUrgentOverride(UUID requestId, String reason, CurrentUser manager) {
        MaintenanceRequest req = requests.findById(requestId)
                .orElseThrow(() -> new NotFoundException("Maintenance request not found: " + requestId));

        if (!"URGENT".equals(req.priority())) {
            throw new ConflictException(ErrorCode.OVERRIDE_NOT_ALLOWED,
                    "Urgent override is only allowed for URGENT priority requests.");
        }

        if (reason == null || reason.isBlank()) {
            throw new ConflictException(ErrorCode.VALIDATION_FAILED,
                    "A reason is required to execute an urgent override.");
        }

        String fromStatus = req.status();
        int rows = requests.startUrgentOverride(requestId, reason.trim(), manager.id());
        if (rows == 0) {
            throw new ConflictException(ErrorCode.OVERRIDE_NOT_ALLOWED,
                    "Urgent override can only be initiated from ASSIGNED or ESTIMATE_SUBMITTED status (current: "
                            + fromStatus + ").");
        }

        history.append(requestId, fromStatus, "IN_PROGRESS", manager.id(),
                "Urgent override started: " + reason.trim());
        return getRequestWithDetails(requestId);
    }

    @Transactional
    public MaintenanceRequest completeWork(UUID requestId, String workDone, long actualCostKobo,
                                           LocalDate completedOn, CurrentUser technician) {
        MaintenanceRequest req = requests.findById(requestId)
                .orElseThrow(() -> new NotFoundException("Maintenance request not found: " + requestId));

        if (req.technician() == null || !req.technician().id().equals(technician.id())) {
            throw new ForbiddenException(ErrorCode.FORBIDDEN,
                    "Only the assigned technician may complete work on this request.");
        }

        int rows = requests.completeWork(requestId, technician.id(), workDone, actualCostKobo, completedOn);
        if (rows == 0) {
            throw new ConflictException(ErrorCode.INVALID_TRANSITION,
                    "Cannot complete work: request is not IN_PROGRESS (current: " + req.status() + ").");
        }

        history.append(requestId, "IN_PROGRESS", "COMPLETED", technician.id(), "Work completed");
        return getRequestWithDetails(requestId);
    }

    @Transactional
    public MaintenanceRequest verifyAndClose(UUID requestId, CurrentUser manager) {
        MaintenanceRequest req = requests.findById(requestId)
                .orElseThrow(() -> new NotFoundException("Maintenance request not found: " + requestId));

        if (req.technician() != null && req.technician().id().equals(manager.id())) {
            throw new ForbiddenException(ErrorCode.CANNOT_CLOSE,
                    "A technician cannot verify their own job.");
        }

        if (req.override() && req.overrideReview() == null) {
            throw new ConflictException(ErrorCode.CANNOT_CLOSE,
                    "Cannot verify and close: the urgent override has not yet been reviewed by finance.");
        }

        if (req.workDone() == null || req.actualCostKobo() == null || req.completedOn() == null) {
            throw new ConflictException(ErrorCode.CANNOT_CLOSE,
                    "Cannot verify and close: completion details are missing.");
        }

        int rows = requests.verifyAndClose(requestId, manager.id());
        if (rows == 0) {
            throw new ConflictException(ErrorCode.CANNOT_CLOSE,
                    "Cannot verify and close: request is not in COMPLETED status (current: " + req.status() + ").");
        }

        history.append(requestId, "COMPLETED", "VERIFIED_CLOSED", manager.id(), "Verified and closed");
        return getRequestWithDetails(requestId);
    }

    @Transactional
    public MaintenanceRequest reviewOverride(UUID requestId, String review, String note, CurrentUser finance) {
        MaintenanceRequest req = requests.findById(requestId)
                .orElseThrow(() -> new NotFoundException("Maintenance request not found: " + requestId));

        if (!req.override()) {
            throw new ConflictException(ErrorCode.INVALID_TRANSITION,
                    "This request does not have an urgent override.");
        }

        if (req.overrideReview() != null) {
            throw new ConflictException(ErrorCode.INVALID_TRANSITION,
                    "This urgent override has already been reviewed.");
        }

        int rows = requests.reviewOverride(requestId, review, note, finance.id());
        if (rows == 0) {
            throw new ConflictException(ErrorCode.INVALID_TRANSITION, "Could not record override review.");
        }

        history.append(requestId, req.status(), req.status(), finance.id(),
                "Override reviewed by finance: " + review + (note != null ? " (" + note + ")" : ""));
        return getRequestWithDetails(requestId);
    }
}
