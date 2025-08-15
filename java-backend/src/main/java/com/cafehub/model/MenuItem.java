package com.cafehub.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "menu_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Menu item name is required")
    @Column(nullable = false)
    private String name;

    @Column(length = 500)
    private String description;

    @NotNull(message = "Price is required")
    @PositiveOrZero(message = "Price must be positive")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "Category is required")
    @Column(nullable = false)
    private Category category;

    private String image;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cafe_id", nullable = false)
    @JsonIgnore
    private Cafe cafe;

    public enum Category {
        BEVERAGE, FOOD, DESSERT, SNACK
    }
}