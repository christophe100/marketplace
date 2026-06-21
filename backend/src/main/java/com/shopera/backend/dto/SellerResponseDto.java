package com.shopera.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerResponseDto {
    private Long id;
    private String storeName;
    private String ownerName;
    private String email;
    private String phone;
    private String address;
    private String joinDate;
    private Double rating;
    private Boolean isSuspended;
    private String token; // Crucial signed JWT string for authorization header
}
