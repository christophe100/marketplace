package com.shopera.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
        System.out.println("==========================================");
        System.out.println("SHOPERA PREMIUM BACKEND IS NOW ONLINE!");
        System.out.println("H2 In-Memory GUI available at: http://localhost:8080/api/h2-console");
        System.out.println("REST API Context active model: http://localhost:8080/api");
        System.out.println("==========================================");
    }
}
