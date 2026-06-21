package com.shopera.backend.controller;

import com.shopera.backend.dto.ProductCreateDto;
import com.shopera.backend.model.Product;
import com.shopera.backend.repository.ProductRepository;
import com.shopera.backend.security.HtmlSanitizer;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    public ResponseEntity<List<Product>> getProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Long sellerId) {
        
        if (category != null && !category.equalsIgnoreCase("Tout")) {
            return ResponseEntity.ok(productRepository.findByCategoryIgnoreCase(HtmlSanitizer.sanitize(category)));
        }
        if (sellerId != null) {
            return ResponseEntity.ok(productRepository.findBySellerId(sellerId));
        }
        return ResponseEntity.ok(productRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> addProduct(
            @Valid @RequestBody ProductCreateDto dto,
            HttpServletRequest request) {
        
        // Retrieve highly trusted seller identifier from custom cryptographic JWT claims
        Long authenticatedSellerId = (Long) request.getAttribute("authenticatedSellerId");
        String authenticatedStoreName = (String) request.getAttribute("authenticatedStoreName");

        if (authenticatedSellerId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Identification de boutique requise pour ajouter un article."));
        }

        Product product = new Product();
        product.setName(HtmlSanitizer.sanitize(dto.getName()));
        product.setCategory(HtmlSanitizer.sanitize(dto.getCategory()));
        product.setPrice(dto.getPrice());
        product.setOriginalPrice(dto.getOriginalPrice());
        product.setImageUrl(dto.getImageUrl());
        product.setStock(dto.getStock());
        product.setBrand(dto.getBrand() != null ? HtmlSanitizer.sanitize(dto.getBrand()) : null);
        product.setDescription(dto.getDescription() != null ? HtmlSanitizer.sanitize(dto.getDescription()) : null);
        product.setColors(dto.getColors());
        product.setIsHot(dto.getIsHot());
        product.setIsNew(dto.getIsNew());
        
        // Bind directly to JWT parameters to completely close Mass Assignment vectors
        product.setSellerId(authenticatedSellerId);
        product.setSellerName(authenticatedStoreName);
        product.setStatus("active");
        product.setRating(5.0);
        product.setReviewsCount(0);

        Product savedProduct = productRepository.save(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedProduct);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductCreateDto dto,
            HttpServletRequest request) {
        
        Long authenticatedSellerId = (Long) request.getAttribute("authenticatedSellerId");

        if (authenticatedSellerId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Authentification requise."));
        }

        return productRepository.findById(id).map(existing -> {
            // Defend against Broken Object Level Authorization (BOLA):
            // Ensure the product belongs to the authenticated seller initiating the update.
            if (!existing.getSellerId().equals(authenticatedSellerId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Accès refusé: Cet article appartient à une autre enseigne."));
            }

            existing.setName(HtmlSanitizer.sanitize(dto.getName()));
            existing.setCategory(HtmlSanitizer.sanitize(dto.getCategory()));
            existing.setPrice(dto.getPrice());
            existing.setOriginalPrice(dto.getOriginalPrice());
            existing.setImageUrl(dto.getImageUrl());
            existing.setStock(dto.getStock());
            existing.setBrand(dto.getBrand() != null ? HtmlSanitizer.sanitize(dto.getBrand()) : null);
            existing.setDescription(dto.getDescription() != null ? HtmlSanitizer.sanitize(dto.getDescription()) : null);
            existing.setColors(dto.getColors());
            existing.setIsHot(dto.getIsHot());
            existing.setIsNew(dto.getIsNew());

            Product updated = productRepository.save(existing);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(
            @PathVariable Long id,
            HttpServletRequest request) {
        
        Long authenticatedSellerId = (Long) request.getAttribute("authenticatedSellerId");

        if (authenticatedSellerId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Authentification requise."));
        }

        return productRepository.findById(id).map(prod -> {
            // Defend against BOLA (Broken Object Level Authorization)
            if (!prod.getSellerId().equals(authenticatedSellerId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Accès refusé: Vous ne disposez pas des permissions pour supprimer cet article."));
            }

            productRepository.delete(prod);
            return ResponseEntity.ok(Map.of("message", "Article retiré de la boutique avec succès."));
        }).orElse(ResponseEntity.notFound().build());
    }
}
