package com.shopera.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusUpdateDto {

    @NotBlank(message = "Le statut de remplacement est obligatoire.")
    private String status;
}
