package com.shopera.backend.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private JwtInterceptor jwtInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Apply JWT protection cleanly on modifying endpoints to prevent any spoofing or illicit updates
        registry.addInterceptor(jwtInterceptor)
                .addPathPatterns("/products", "/products/**", "/orders/*/status")
                .excludePathPatterns("/sellers", "/sellers/*", "/sellers/login", "/sellers/register")
                .excludePathPatterns("/orders"); // Public placing is authorized; status mutation is locked down
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("Authorization")
                .maxAge(3600);
    }
}
