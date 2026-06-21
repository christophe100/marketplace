package com.shopera.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private Double price;

    private Double originalPrice;

    private Double rating = 5.0;

    private Integer reviewsCount = 0;

    @Column(length = 1000)
    private String imageUrl;

    private String status = "active"; // active, inactive, pending

    private Integer stock = 10;

    private String brand;

    @Column(length = 2000)
    private String description;

    private String colors; // Comma separated list of hex values e.g. "#4A1118,#717171"

    private Long sellerId;

    private String sellerName;

    private Boolean isHot = false;

    private Boolean isNew = false;
}
