package com.shopera.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SellerRegisterDto {

    @NotBlank(message = "Le nom de la boutique est obligatoire.")
    @Size(min = 2, max = 100, message = "Le nom de la boutique doit être compris entre 2 et 100 caractères.")
    private String storeName;

    @NotBlank(message = "Le nom du propriétaire de la boutique est obligatoire.")
    @Size(min = 2, max = 100, message = "Le nom du propriétaire doit être compris entre 2 et 100 caractères.")
    private String ownerName;

    @NotBlank(message = "L'adresse email est obligatoire.")
    @Email(message = "L'adresse email doit être valide.")
    private String email;

    @NotBlank(message = "Le numéro de téléphone est obligatoire.")
    private String phone;

    @NotBlank(message = "L'adresse physique de la boutique est obligatoire.")
    private String address;

    @NotBlank(message = "Le mot de passe est obligatoire.")
    @Size(min = 6, max = 50, message = "Le mot de passe doit comporter au moins 6 caractères pour préserver sa robustesse.")
    private String password;
}
