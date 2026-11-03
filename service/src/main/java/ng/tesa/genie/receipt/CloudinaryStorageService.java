package ng.tesa.genie.receipt;

import java.io.InputStream;

public interface CloudinaryStorageService {

    record UploadResult(
            String publicId,
            String resourceType,
            String format,
            long bytes
    ) {
    }

    boolean isConfigured();

    UploadResult upload(byte[] fileBytes, String folder, String detectedFormat, String resourceType);

    InputStream downloadStream(String publicId, String resourceType, String format);

    void delete(String publicId, String resourceType);
}
