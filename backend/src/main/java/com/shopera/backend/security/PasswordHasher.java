package com.shopera.backend.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

public class PasswordHasher {

    /**
     * Generates a secure, cryptographically strong random salt.
     */
    public static String generateSalt() {
        SecureRandom random = new SecureRandom();
        byte[] saltBytes = new byte[16];
        random.nextBytes(saltBytes);
        return Base64.getEncoder().encodeToString(saltBytes);
    }

    /**
     * Hashes a password together with a salt using SHA-256.
     */
    public static String hashPassword(String password, String salt) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            
            // Apply salt before password to defend against length extension attacks
            String saltedInput = salt + password;
            byte[] hashedBytes = digest.digest(saltedInput.getBytes(StandardCharsets.UTF_8));
            
            // Multi-iteration stretching for added resistance to brute force attacks
            for (int i = 0; i < 1000; i++) {
                hashedBytes = digest.digest(hashedBytes);
            }
            
            return Base64.getEncoder().encodeToString(hashedBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Erreur critique: Algorithme SHA-256 non disponible", e);
        }
    }

    /**
     * Checks if a raw password matches a stored hashed password.
     */
    public static boolean verifyPassword(String password, String salt, String storedHash) {
        if (password == null || salt == null || storedHash == null) {
            return false;
        }
        String calculatedHash = hashPassword(password, salt);
        return MessageDigest.isEqual(
            calculatedHash.getBytes(StandardCharsets.UTF_8), 
            storedHash.getBytes(StandardCharsets.UTF_8)
        );
    }
}
