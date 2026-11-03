package ng.tesa.genie.receipt;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import ng.tesa.genie.common.ConflictException;
import ng.tesa.genie.common.ErrorCode;
import ng.tesa.genie.config.AppProperties;

@Service
public class DefaultCloudinaryStorageService implements CloudinaryStorageService {

    private static final Logger log = LoggerFactory.getLogger(DefaultCloudinaryStorageService.class);

    private final Cloudinary cloudinary;
    private final boolean isConfigured;
    private final HttpClient httpClient;

    // In-memory fallback storage for offline test runs or unconfigured environments
    private final Map<String, byte[]> localFallbackStore = new ConcurrentHashMap<>();

    public DefaultCloudinaryStorageService(AppProperties properties) {
        AppProperties.Cloudinary cProps = properties.cloudinary();
        if (cProps != null && cProps.isConfigured()) {
            Map<String, Object> config = new HashMap<>();
            config.put("cloud_name", cProps.cloudName());
            config.put("api_key", cProps.apiKey());
            config.put("api_secret", cProps.apiSecret());
            config.put("secure", true);
            this.cloudinary = new Cloudinary(config);
            this.isConfigured = true;
        } else {
            this.cloudinary = null;
            this.isConfigured = false;
        }
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    @Override
    public UploadResult upload(byte[] fileBytes, String folder, String detectedFormat, String resourceType) {
        if (!isConfigured) {
            String publicId = folder + "/" + UUID.randomUUID();
            localFallbackStore.put(publicId, fileBytes);
            return new UploadResult(publicId, resourceType, detectedFormat, fileBytes.length);
        }

        try {
            Map<?, ?> uploadParams = ObjectUtils.asMap(
                    "type", "authenticated",
                    "resource_type", "auto",
                    "folder", folder,
                    "use_filename", false,
                    "unique_filename", true,
                    "overwrite", false
            );

            Map<?, ?> result = cloudinary.uploader().upload(fileBytes, uploadParams);
            String publicId = (String) result.get("public_id");
            String resType = (String) result.get("resource_type");
            String format = (String) result.get("format");
            if (format == null || format.isBlank()) {
                format = detectedFormat;
            }
            long bytes = ((Number) result.get("bytes")).longValue();

            return new UploadResult(publicId, resType, format, bytes);
        } catch (Exception e) {
            log.error("Cloudinary upload failed: {}", e.getMessage());
            throw new ConflictException(ErrorCode.RECEIPT_STORAGE_ERROR, "Storage service encountered an error.");
        }
    }

    @Override
    public InputStream downloadStream(String publicId, String resourceType, String format) {
        if (!isConfigured) {
            byte[] bytes = localFallbackStore.get(publicId);
            if (bytes == null) {
                throw new ConflictException(ErrorCode.NOT_FOUND, "Stored receipt file not found.");
            }
            return new ByteArrayInputStream(bytes);
        }

        try {
            String signedUrl = cloudinary.url()
                    .type("authenticated")
                    .resourceType(resourceType)
                    .format(format)
                    .signed(true)
                    .generate(publicId);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(signedUrl))
                    .timeout(Duration.ofSeconds(15))
                    .GET()
                    .build();

            HttpResponse<InputStream> response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());
            if (response.statusCode() != 200) {
                log.error("Upstream receipt download failed with status {}", response.statusCode());
                throw new ConflictException(ErrorCode.RECEIPT_STORAGE_ERROR, "Could not retrieve receipt from storage.");
            }

            return response.body();
        } catch (Exception e) {
            log.error("Cloudinary download error: {}", e.getMessage());
            throw new ConflictException(ErrorCode.RECEIPT_STORAGE_ERROR, "Failed to stream receipt file.");
        }
    }

    @Override
    public void delete(String publicId, String resourceType) {
        if (!isConfigured) {
            localFallbackStore.remove(publicId);
            return;
        }

        try {
            Map<?, ?> destroyParams = ObjectUtils.asMap(
                    "type", "authenticated",
                    "resource_type", resourceType != null ? resourceType : "image",
                    "invalidate", true
            );
            cloudinary.uploader().destroy(publicId, destroyParams);
        } catch (Exception e) {
            log.error("Cloudinary delete error: {}", e.getMessage());
            // Log but don't expose stack traces
        }
    }
}
