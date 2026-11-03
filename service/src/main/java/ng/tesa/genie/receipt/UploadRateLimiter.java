package ng.tesa.genie.receipt;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

import ng.tesa.genie.common.RateLimitExceededException;

@Component
public class UploadRateLimiter {

    private static final int MAX_REQUESTS_PER_WINDOW = 10;
    private static final long WINDOW_SECONDS = 60;

    private final Map<String, Deque<Long>> userLimits = new ConcurrentHashMap<>();
    private final Map<String, Deque<Long>> ipLimits = new ConcurrentHashMap<>();

    public synchronized void checkRateLimit(UUID userId, String clientIp) {
        long now = Instant.now().getEpochSecond();

        if (userId != null) {
            checkAndRecord(userLimits, userId.toString(), now, "User upload rate limit exceeded. Maximum 10 uploads per minute.");
        }

        if (clientIp != null && !clientIp.isBlank()) {
            checkAndRecord(ipLimits, clientIp.trim(), now, "IP upload rate limit exceeded. Maximum 10 uploads per minute.");
        }
    }

    private void checkAndRecord(Map<String, Deque<Long>> map, String key, long now, String message) {
        Deque<Long> timestamps = map.computeIfAbsent(key, k -> new ArrayDeque<>());
        long windowStart = now - WINDOW_SECONDS;

        while (!timestamps.isEmpty() && timestamps.peekFirst() < windowStart) {
            timestamps.pollFirst();
        }

        if (timestamps.size() >= MAX_REQUESTS_PER_WINDOW) {
            throw new RateLimitExceededException(message);
        }

        timestamps.addLast(now);
    }

    public synchronized void reset() {
        userLimits.clear();
        ipLimits.clear();
    }
}
