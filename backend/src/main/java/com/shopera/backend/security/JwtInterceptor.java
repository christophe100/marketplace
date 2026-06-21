package com.shopera.backend.security;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;

@Component
public class JwtInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Allow CORS preflight requests (OPTIONS) to bypass authentication
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        // Allow public read actions (GET) to bypass authentication (e.g. catalog queries)
        if ("GET".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            sendUnauthorizedError(response, "Accès refusé: Jeton d'authentification manquant dans l'en-tête Authorization.");
            return false;
        }

        String token = authHeader.substring(7); // Extract the token

        try {
            DecodedJWT decodedJWT = JwtUtil.verifyToken(token);
            
            // Inject claims into request context to empower downstream authorization logic
            request.setAttribute("authenticatedSellerId", JwtUtil.getSellerId(decodedJWT));
            request.setAttribute("authenticatedEmail", JwtUtil.getEmail(decodedJWT));
            request.setAttribute("authenticatedStoreName", JwtUtil.getStoreName(decodedJWT));
            
            return true; // Token is valid, proceed with request execution chain
        } catch (JWTVerificationException e) {
            sendUnauthorizedError(response, "Jeton invalide ou expiré. Veuillez vous reconnecter.");
            return false;
        }
    }

    private void sendUnauthorizedError(HttpServletResponse response, String message) throws IOException {
        response.setContentType("application/json;charset=UTF-8");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.getWriter().write(
            "{" +
            "\"error\":\"Unauthorized\"," +
            "\"message\":\"" + message + "\"," +
            "\"status\":401" +
            "}"
        );
    }
}
