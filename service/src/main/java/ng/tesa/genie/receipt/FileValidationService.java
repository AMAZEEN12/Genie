package ng.tesa.genie.receipt;

import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Arrays;
import javax.imageio.ImageIO;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import ng.tesa.genie.common.ErrorCode;
import ng.tesa.genie.common.FileValidationException;

@Service
public class FileValidationService {

    public static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

    public record ValidatedFile(
            byte[] bytes,
            String originalFilename,
            String detectedFormat,
            String resourceType,
            String mimeType
    ) {
    }

    public ValidatedFile validateAndSanitize(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new FileValidationException(ErrorCode.VALIDATION_FAILED, "No file provided for upload.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new FileValidationException(ErrorCode.FILE_TOO_LARGE, "File size exceeds the 10MB limit.");
        }

        byte[] rawBytes;
        try {
            rawBytes = file.getBytes();
        } catch (IOException e) {
            throw new FileValidationException(ErrorCode.VALIDATION_FAILED, "Could not read uploaded file bytes.");
        }

        if (rawBytes.length == 0 || rawBytes.length > MAX_FILE_SIZE) {
            throw new FileValidationException(ErrorCode.FILE_TOO_LARGE, "File size exceeds the 10MB limit.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            originalFilename = "receipt";
        }

        // Magic byte verification (ignoring client's declared content-type and file extension)
        String detectedFormat = detectFormatFromBytes(rawBytes);
        if (detectedFormat == null) {
            throw new FileValidationException(ErrorCode.INVALID_FILE_TYPE,
                    "Invalid file type. Only JPEG, PNG, WebP, and PDF are accepted.");
        }

        if ("pdf".equals(detectedFormat)) {
            return new ValidatedFile(rawBytes, originalFilename, "pdf", "raw", "application/pdf");
        }

        // Re-encode image to strip EXIF, GPS location, camera model and device metadata
        byte[] cleanImageBytes = stripImageMetadata(rawBytes, detectedFormat);
        String mimeType = switch (detectedFormat) {
            case "png" -> "image/png";
            case "webp" -> "image/webp";
            default -> "image/jpeg";
        };

        return new ValidatedFile(cleanImageBytes, originalFilename, detectedFormat, "image", mimeType);
    }

    private String detectFormatFromBytes(byte[] bytes) {
        if (bytes.length < 8) {
            return null;
        }

        // PDF: starts with %PDF- (0x25 0x50 0x44 0x46 0x2D)
        if (bytes[0] == 0x25 && bytes[1] == 0x50 && bytes[2] == 0x44 && bytes[3] == 0x46) {
            return "pdf";
        }

        // JPEG: starts with 0xFF 0xD8 0xFF
        if ((bytes[0] & 0xFF) == 0xFF && (bytes[1] & 0xFF) == 0xD8 && (bytes[2] & 0xFF) == 0xFF) {
            return "jpeg";
        }

        // PNG: starts with 89 50 4E 47 0D 0A 1A 0A
        if ((bytes[0] & 0xFF) == 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47
                && bytes[4] == 0x0D && bytes[5] == 0x0A && bytes[6] == 0x1A && bytes[7] == 0x0A) {
            return "png";
        }

        // WebP: RIFF (bytes 0-3) and WEBP (bytes 8-11)
        if (bytes.length >= 12
                && bytes[0] == 'R' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == 'F'
                && bytes[8] == 'W' && bytes[9] == 'E' && bytes[10] == 'B' && bytes[11] == 'P') {
            return "webp";
        }

        return null;
    }

    private byte[] stripImageMetadata(byte[] rawBytes, String format) {
        try {
            BufferedImage image = ImageIO.read(new ByteArrayInputStream(rawBytes));
            if (image == null) {
                throw new FileValidationException(ErrorCode.INVALID_FILE_TYPE,
                        "Image format is corrupt or unrecognized.");
            }

            // Normalise image buffer (ensure RGB/ARGB without proprietary metadata chunks)
            int imageType = image.getColorModel().hasAlpha() ? BufferedImage.TYPE_INT_ARGB : BufferedImage.TYPE_INT_RGB;
            BufferedImage cleanImage = new BufferedImage(image.getWidth(), image.getHeight(), imageType);
            Graphics2D g2d = cleanImage.createGraphics();
            g2d.drawImage(image, 0, 0, null);
            g2d.dispose();

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            String writeFormat = "png".equalsIgnoreCase(format) ? "png" : "jpeg";
            boolean written = ImageIO.write(cleanImage, writeFormat, baos);
            if (!written || baos.size() == 0) {
                // Fallback to write format
                baos.reset();
                ImageIO.write(cleanImage, "png", baos);
            }
            return baos.toByteArray();
        } catch (IOException e) {
            throw new FileValidationException(ErrorCode.INVALID_FILE_TYPE,
                    "Failed to process and sanitize image.");
        }
    }
}
