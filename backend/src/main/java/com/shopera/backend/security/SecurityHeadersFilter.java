package com.shopera.backend.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class SecurityHeadersFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {}

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        if (response instanceof HttpServletResponse) {
            HttpServletResponse httpResponse = (HttpServletResponse) response;
            
            // Defend against clickjacking attacks by blocking iframe nesting of API routes
            httpResponse.setHeader("X-Frame-Options", "DENY");
            
            // Force browser to respect Content-Type MIME-types and avert content-sniffing exploits
            httpResponse.setHeader("X-Content-Type-Options", "nosniff");
            
            // Activate integrated browser XSS filters and force immediate blocking upon detection
            httpResponse.setHeader("X-XSS-Protection", "1; mode=block");
            
            // Standard referrer policy configuration to limit contextual data exposure
            httpResponse.setHeader("Referrer-Policy", "no-referrer-when-downgrade");
            
            // Limit permissions request contexts
            httpResponse.setHeader("Permission-Policy", "geolocation=(), microphone=(), camera=()");
        }
        
        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {}
}
