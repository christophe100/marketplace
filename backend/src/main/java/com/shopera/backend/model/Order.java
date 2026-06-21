package com.shopera.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String date;

    private Long productId;

    private String productName;

    @Column(length = 1000)
    private String productImage;

    private String buyerName;

    private String buyerEmail;

    private Integer quantity;

    private Double totalAmount;

    private String status = "En attente"; // 'Livrée', 'En traitement', 'Expédiée', 'Annulée', 'En attente'

    private Long sellerId;
}
