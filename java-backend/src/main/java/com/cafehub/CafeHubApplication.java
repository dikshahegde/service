package com.cafehub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class CafeHubApplication {

    public static void main(String[] args) {
        SpringApplication.run(CafeHubApplication.class, args);
        System.out.println("🚀 CafeHub Backend API is running on http://localhost:8080/api");
    }
}