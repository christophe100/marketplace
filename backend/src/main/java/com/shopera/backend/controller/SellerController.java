package com.shopera.backend.controller;

import com.shopera.backend.dto.SellerLoginDto;
import com.shopera.backend.dto.SellerRegisterDto;
import com.shopera.backend.dto.SellerResponseDto;
import com.shopera.backend.model.Seller;
import com.shopera.backend.repository.SellerRepository;
import com.shopera.backend.security.HtmlSanitizer;
import com.shopera.backend.security.JwtUtil;
import com.shopera.backend.security.PasswordHasher;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/sellers")
@CrossOrigin(origins = "*")
public class SellerController {

    @Autowired
    private SellerRepository sellerRepository;

    private static final Pattern PASSWORD_PATTERN = 
        Pattern.compile("^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$");

    @GetMapping
    public ResponseEntity<List<SellerResponseDto>> getAllSellers() {
        List<SellerResponseDto> dtos = sellerRepository.findAll().stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerSeller(@Valid @RequestBody SellerRegisterDto dto) {
        if (sellerRepository.findByEmail(dto.getEmail().trim()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "L'adresse email est déjà utilisée par une autre boutique."));
        }
        if (sellerRepository.findByStoreName(dto.getStoreName().trim()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Le nom de la boutique est déjà utilisé. Veuillez en choisir un autre unique."));
        }

        // Robust password composition auditing to stop weak credentials
        String password = dto.getPassword();
        if (!PASSWORD_PATTERN.matcher(password).matches()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Sécurité du mot de passe insuffisante. Le mot de passe doit mesurer au moins 8 caractères, contenir au moins un chiffre, une lettre minuscule et une lettre majuscule."));
        }

        // Secure password hashing
        String salt = PasswordHasher.generateSalt();
        String hashedPassword = PasswordHasher.hashPassword(password, salt);

        Seller seller = new Seller();
        seller.setStoreName(HtmlSanitizer.sanitize(dto.getStoreName()));
        seller.setOwnerName(HtmlSanitizer.sanitize(dto.getOwnerName()));
        seller.setEmail(dto.getEmail().trim().toLowerCase());
        seller.setPhone(HtmlSanitizer.sanitize(dto.getPhone()));
        seller.setAddress(HtmlSanitizer.sanitize(dto.getAddress()));
        seller.setRating(5.0);
        seller.setIsSuspended(false);
        seller.setJoinDate(DateTimeFormatter.ofPattern("dd MMMM yyyy").format(LocalDateTime.now()));
        seller.setSalt(salt);
        seller.setPasswordHash(hashedPassword);

        Seller savedSeller = sellerRepository.save(seller);

        // JWT token generation
        String token = JwtUtil.generateToken(savedSeller.getId(), savedSeller.getEmail(), savedSeller.getStoreName());

        SellerResponseDto responseDto = convertToResponseDto(savedSeller);
        responseDto.setToken(token);

        return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginSeller(@Valid @RequestBody SellerLoginDto dto) {
        Optional<Seller> optionalSeller = sellerRepository.findByEmail(dto.getEmail().trim().toLowerCase());
        if (optionalSeller.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Aucune boutique enregistrée avec cette adresse email."));
        }

        Seller seller = optionalSeller.get();
        if (seller.getIsSuspended()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Votre boutique exclusive a été suspendue temporairement de la plateforme."));
        }

        // Cryptographic password validation
        boolean matches = PasswordHasher.verifyPassword(dto.getPassword(), seller.getSalt(), seller.getPasswordHash());
        if (!matches) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Mot de passe incorrect. Veuillez réessayer."));
        }

        // Generate critical session token
        String token = JwtUtil.generateToken(seller.getId(), seller.getEmail(), seller.getStoreName());

        SellerResponseDto responseDto = convertToResponseDto(seller);
        responseDto.setToken(token);

        return ResponseEntity.ok(responseDto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSellerById(@PathVariable Long id) {
        return sellerRepository.findById(id)
                .map(this::convertToResponseDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    private SellerResponseDto convertToResponseDto(Seller seller) {
        return SellerResponseDto.builder()
                .id(seller.getId())
                .storeName(seller.getStoreName())
                .ownerName(seller.getOwnerName())
                .email(seller.getEmail())
                .phone(seller.getPhone())
                .address(seller.getAddress())
                .joinDate(seller.getJoinDate())
                .rating(seller.getRating())
                .isSuspended(seller.getIsSuspended())
                .build();
    }
}
