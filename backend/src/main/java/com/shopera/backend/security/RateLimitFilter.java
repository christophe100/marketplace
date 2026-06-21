package com.shopera.backend.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter implements Filter {

    // Simple in-memory token bucket registry grouping clients by remote IP address
    private static final Map<String, TokenBucket> ipLimits = new ConcurrentHashMap<>();
    
    // Auth endpoints limits: tighter threshold for login/register
    private static final int AUTH_MAX_TOKENS = 15;
    private static final long AUTH_REFILL_DURATION_MS = 60000; // 1 minute
    
    // Generic endpoints limits
    private static final int GLOBAL_MAX_TOKENS = 150;
    private static final long GLOBAL_REFILL_DURATION_MS = 60000; // 1 minute

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {}

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        if (!(request instanceof HttpServletRequest) || !(response instanceof HttpServletResponse)) {
            chain.doFilter(request, response);
            return;
        }

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // Skip rate-limiting for OPTIONS preflight checks
        if ("OPTIONS".equalsIgnoreCase(httpRequest.getMethod())) {
            chain.doFilter(request, response);
            return;
        }

        String ip = getClientIP(httpRequest);
        String path = httpRequest.getRequestURI();

        boolean isAuthEndpoint = path.contains("/sellers/login") || path.contains("/sellers/register");
        
        TokenBucket bucket = ipLimits.computeIfAbsent(ip + ":" + (isAuthEndpoint ? "auth" : "global"), key -> {
            if (isAuthEndpoint) {
                return new TokenBucket(AUTH_MAX_TOKENS, AUTH_REFILL_DURATION_MS);
            } else {
                return new TokenBucket(GLOBAL_MAX_TOKENS, GLOBAL_REFILL_DURATION_MS);
            }
        });

        if (!bucket.tryConsume()) {
            httpResponse.setStatus(429); // Too Many Requests
            httpResponse.setContentType("application/json;charset=UTF-8");
            httpResponse.getWriter().write(
                "{" +
                "\"error\":\"Too Many Requests\"," +
                "\"message\":\"Trop de requêtes détectées de manière consécutive. Veuillez patienter une minute avant de réessayer.\"," +
                "\"status\":429" +
                "}"
            );
            return;
        }

        chain.doFilter(request, response);
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }

    @Override
    public void destroy() {}

    /**
     * Light-weight, thread-safe nested Token Bucket implementation.
     */
    private static class TokenBucket {
        private final int capacity;
        private final long refillPeriodMs;
        private double tokens;
        private long lastRefillTime;

        public TokenBucket(int capacity, long refillPeriodMs) {
            this.capacity = capacity;
            this.tokens = capacity;
            this.refillPeriodMs = refillPeriodMs;
            this.lastRefillTime = System.currentTimeMillis();
        }

        public synchronized boolean tryConsume() {
            refill();
            if (tokens >= 1.0) {
                tokens -= 1.0;
                return true;
            }
            return false;
        }

        private void refill() {
            long now = System.currentTimeMillis();
            long elapsed = now - lastRefillTime;
            
            if (elapsed > 0) {
                double tokensToAdd = ((double) elapsed / refillPeriodMs) * capacity;
                tokens = Math.min(capacity, tokens + tokensToAdd);
                lastRefillTime = now;
            }
        }
    }
}
