package com.shopera.backend.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;

import java.util.Date;

public class JwtUtil {

    // Default hardcoded secret key for local development; system-configured secret fallback for production
    private static final String DEFAULT_SECRET = "shopera_luxury_marketplace_ultra_secure_jwt_secret_token_key_2026";
    private static final String SECRET_KEY = System.getenv("JWT_SECRET") != null ? System.getenv("JWT_SECRET") : DEFAULT_SECRET;
    
    // 24 Hours validity duration
    private static final long EXPIRATION_TIME = 24 * 60 * 60 * 1000L; 
    
    private static final String ISSUER = "shopera-marketplace";
    private static final Algorithm algorithm = Algorithm.HMAC256(SECRET_KEY);

    /**
     * Generates a signed JWT with specific claims.
     */
    public static String generateToken(Long sellerId, String email, String storeName) {
        return JWT.create()
                .withIssuer(ISSUER)
                .withSubject(email)
                .withClaim("sellerId", sellerId)
                .withClaim("storeName", storeName)
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .sign(algorithm);
    }

    /**
     * Verifies the cryptographic signature of the token and checks expiration.
     */
    public static DecodedJWT verifyToken(String token) throws JWTVerificationException {
        JWTVerifier verifier = JWT.require(algorithm)
                .withIssuer(ISSUER)
                .build();
        return verifier.verify(token);
    }

    /**
     * Extracts sellerId claim from decoded JWT.
     */
    public static Long getSellerId(DecodedJWT decodedJWT) {
        return decodedJWT.getClaim("sellerId").asLong();
    }

    /**
     * Extracts email from decoded JWT.
     */
    public static String getEmail(DecodedJWT decodedJWT) {
        return decodedJWT.getSubject();
    }

    /**
     * Extracts storeName claim from decoded JWT.
     */
    public static String getStoreName(DecodedJWT decodedJWT) {
        return decodedJWT.getClaim("storeName").asString();
    }
}
