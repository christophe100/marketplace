package com.shopera.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductCreateDto {

    @NotBlank(message = "Le nom de l'article de luxe est obligatoire.")
    private String name;

    @NotBlank(message = "La catégorie de l'article est obligatoire.")
    private String category;

    @NotNull(message = "Le prix de l'article est obligatoire.")
    @DecimalMin(value = "0.01", message = "Le prix de l'article doit être strictement positif.")
    private Double price;

    private Double originalPrice;

    private String imageUrl;

    @NotNull(message = "La quantité en stock est obligatoire.")
    @Min(value = 0, message = "La quantité en stock ne peut pas être inférieure à 0.")
    private Integer stock = 1;

    private String brand;

    private String description;

    private String colors; // Hex values separated by comma
    
    private Boolean isHot = false;
    
    private Boolean isNew = false;
}
