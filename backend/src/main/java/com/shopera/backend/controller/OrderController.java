package com.shopera.backend.controller;

import com.shopera.backend.dto.OrderStatusUpdateDto;
import com.shopera.backend.model.Order;
import com.shopera.backend.repository.OrderRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @GetMapping
    public ResponseEntity<List<Order>> getOrders(
            @RequestParam(required = false) Long sellerId,
            @RequestParam(required = false) String buyerEmail) {

        if (sellerId != null) {
            return ResponseEntity.ok(orderRepository.findBySellerId(sellerId));
        }
        if (buyerEmail != null) {
            return ResponseEntity.ok(orderRepository.findByBuyerEmail(buyerEmail));
        }
        return ResponseEntity.ok(orderRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> placeOrders(@RequestBody List<Order> orders) {
        // Buyer placing order doesn't require backend registration/bearer tok for standard luxury guest checkout
        if (orders == null || orders.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "La liste de commandes ne peut pas être vide."));
        }
        List<Order> savedOrders = orderRepository.saveAll(orders);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedOrders);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrderStatusUpdateDto dto,
            HttpServletRequest request) {
        
        Long authenticatedSellerId = (Long) request.getAttribute("authenticatedSellerId");
        if (authenticatedSellerId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Authentification requise pour effectuer cette action."));
        }

        return orderRepository.findById(id).map(existing -> {
            // Secure validation: Enforce that only the seller owning the order can mutate the status!
            if (!existing.getSellerId().equals(authenticatedSellerId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Accès refusé: Vous ne pouvez pas modifier une commande d'une autre boutique."));
            }

            existing.setStatus(dto.getStatus().trim());
            orderRepository.save(existing);
            return ResponseEntity.ok(Map.of(
                "message", "Le statut de la commande a été mis à jour de manière sécurisée !",
                "status", existing.getStatus()
            ));
        }).orElse(ResponseEntity.notFound().build());
    }
}
