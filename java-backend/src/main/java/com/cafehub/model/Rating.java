package com.cafehub.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "ratings", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "cafe_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Rating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cafe_id", nullable = false)
    private Cafe cafe;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must not exceed 5")
    @Column(nullable = false)
    private Integer rating;

    @NotBlank(message = "Review is required")
    @Size(max = 1000, message = "Review must not exceed 1000 characters")
    @Column(nullable = false, length = 1000)
    private String review;

    @Embedded
    private AspectRatings aspects;

    @ManyToMany
    @JoinTable(
        name = "rating_helpful",
        joinColumns = @JoinColumn(name = "rating_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> helpfulUsers = new HashSet<>();

    private Integer helpfulCount = 0;

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
    public static class AspectRatings {
        @Min(value = 1, message = "Food rating must be at least 1")
        @Max(value = 5, message = "Food rating must not exceed 5")
        private Integer food;

        @Min(value = 1, message = "Service rating must be at least 1")
        @Max(value = 5, message = "Service rating must not exceed 5")
        private Integer service;

        @Min(value = 1, message = "Ambiance rating must be at least 1")
        @Max(value = 5, message = "Ambiance rating must not exceed 5")
        private Integer ambiance;

        @Min(value = 1, message = "Value rating must be at least 1")
        @Max(value = 5, message = "Value rating must not exceed 5")
        private Integer value;
    }

    @PrePersist
    @PreUpdate
    private void updateHelpfulCount() {
        this.helpfulCount = this.helpfulUsers != null ? this.helpfulUsers.size() : 0;
    }
}