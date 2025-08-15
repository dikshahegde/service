package com.cafehub.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "cafes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Cafe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Cafe name is required")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Description is required")
    @Column(nullable = false, length = 1000)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @ElementCollection
    @CollectionTable(name = "cafe_images", joinColumns = @JoinColumn(name = "cafe_id"))
    @Column(name = "image_url")
    private List<String> images = new ArrayList<>();

    @Embedded
    private Location location;

    @Embedded
    private Contact contact;

    @OneToMany(mappedBy = "cafe", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<MenuItem> menu = new ArrayList<>();

    @Embedded
    private Budget averageBudget;

    @ElementCollection
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "cafe_amenities", joinColumns = @JoinColumn(name = "cafe_id"))
    @Column(name = "amenity")
    private Set<Amenity> amenities = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "cafe_hours", joinColumns = @JoinColumn(name = "cafe_id"))
    @MapKeyEnumerated(EnumType.STRING)
    @MapKeyColumn(name = "day_of_week")
    private java.util.Map<DayOfWeek, OperatingHours> hours = new java.util.HashMap<>();

    @OneToMany(mappedBy = "cafe", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Rating> ratings = new HashSet<>();

    private BigDecimal averageRating = BigDecimal.ZERO;
    private Integer ratingCount = 0;

    private Boolean isActive = true;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Location {
        @NotBlank(message = "Address is required")
        @Column(nullable = false)
        private String address;

        @NotBlank(message = "City is required")
        @Column(nullable = false)
        private String city;

        @NotBlank(message = "State is required")
        @Column(nullable = false)
        private String state;

        @NotBlank(message = "ZIP code is required")
        @Column(name = "zip_code", nullable = false)
        private String zipCode;

        private BigDecimal latitude = BigDecimal.ZERO;
        private BigDecimal longitude = BigDecimal.ZERO;
    }

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Contact {
        @NotBlank(message = "Phone is required")
        @Column(nullable = false)
        private String phone;

        @NotBlank(message = "Email is required")
        @Column(nullable = false)
        private String email;

        private String website;
    }

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Budget {
        @NotNull(message = "Minimum budget is required")
        @Column(name = "min_budget", nullable = false)
        private BigDecimal min;

        @NotNull(message = "Maximum budget is required")
        @Column(name = "max_budget", nullable = false)
        private BigDecimal max;
    }

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OperatingHours {
        private String openTime;
        private String closeTime;
        private Boolean closed = false;
    }

    public enum Amenity {
        WIFI, PARKING, OUTDOOR_SEATING, LIVE_MUSIC, PET_FRIENDLY, TAKEAWAY, DELIVERY
    }

    public enum DayOfWeek {
        MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
    }
}