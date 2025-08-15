package com.cafehub.repository;

import com.cafehub.model.Cafe;
import com.cafehub.model.Rating;
import com.cafehub.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {

    /**
     * Find rating by user and cafe
     */
    Optional<Rating> findByUserAndCafe(User user, Cafe cafe);

    /**
     * Check if user has rated a cafe
     */
    boolean existsByUserAndCafe(User user, Cafe cafe);

    /**
     * Find all ratings for a cafe
     */
    Page<Rating> findByCafe(Cafe cafe, Pageable pageable);

    /**
     * Find all ratings by a user
     */
    Page<Rating> findByUser(User user, Pageable pageable);

    /**
     * Find ratings for a cafe ordered by creation date (newest first)
     */
    Page<Rating> findByCafeOrderByCreatedAtDesc(Cafe cafe, Pageable pageable);

    /**
     * Find ratings for a cafe ordered by rating (highest first)
     */
    Page<Rating> findByCafeOrderByRatingDesc(Cafe cafe, Pageable pageable);

    /**
     * Find ratings for a cafe ordered by helpful count (most helpful first)
     */
    Page<Rating> findByCafeOrderByHelpfulCountDesc(Cafe cafe, Pageable pageable);

    /**
     * Find ratings with specific rating value for a cafe
     */
    List<Rating> findByCafeAndRating(Cafe cafe, Integer rating);

    /**
     * Calculate average rating for a cafe
     */
    @Query("SELECT AVG(r.rating) FROM Rating r WHERE r.cafe = :cafe")
    Optional<BigDecimal> findAverageRatingByCafe(@Param("cafe") Cafe cafe);

    /**
     * Count ratings for a cafe
     */
    long countByCafe(Cafe cafe);

    /**
     * Count ratings by rating value for a cafe (for distribution)
     */
    @Query("SELECT r.rating, COUNT(r) FROM Rating r WHERE r.cafe = :cafe GROUP BY r.rating ORDER BY r.rating DESC")
    List<Object[]> findRatingDistributionByCafe(@Param("cafe") Cafe cafe);

    /**
     * Find most helpful ratings for a cafe
     */
    @Query("SELECT r FROM Rating r WHERE r.cafe = :cafe AND r.helpfulCount > 0 ORDER BY r.helpfulCount DESC")
    Page<Rating> findMostHelpfulRatingsByCafe(@Param("cafe") Cafe cafe, Pageable pageable);

    /**
     * Find ratings that a user marked as helpful
     */
    @Query("SELECT r FROM Rating r JOIN r.helpfulUsers u WHERE u = :user")
    Page<Rating> findRatingsMarkedHelpfulByUser(@Param("user") User user, Pageable pageable);

    /**
     * Find recent ratings (last 30 days)
     */
    @Query("SELECT r FROM Rating r WHERE r.createdAt >= CURRENT_DATE - 30 ORDER BY r.createdAt DESC")
    Page<Rating> findRecentRatings(Pageable pageable);

    /**
     * Find top rated cafes based on average rating and minimum review count
     */
    @Query("SELECT r.cafe FROM Rating r GROUP BY r.cafe HAVING COUNT(r) >= :minReviews ORDER BY AVG(r.rating) DESC")
    Page<Cafe> findTopRatedCafes(@Param("minReviews") long minReviews, Pageable pageable);

    /**
     * Search ratings by review content
     */
    @Query("SELECT r FROM Rating r WHERE LOWER(r.review) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Rating> searchByReviewContent(@Param("searchTerm") String searchTerm, Pageable pageable);

    /**
     * Find user's ratings ordered by creation date
     */
    Page<Rating> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    /**
     * Count total ratings by a user
     */
    long countByUser(User user);

    /**
     * Find all users who rated a specific cafe
     */
    @Query("SELECT DISTINCT r.user FROM Rating r WHERE r.cafe = :cafe")
    List<User> findUsersWhoRatedCafe(@Param("cafe") Cafe cafe);

    /**
     * Check if a user marked a rating as helpful
     */
    @Query("SELECT COUNT(u) > 0 FROM Rating r JOIN r.helpfulUsers u WHERE r = :rating AND u = :user")
    boolean isRatingMarkedHelpfulByUser(@Param("rating") Rating rating, @Param("user") User user);

    /**
     * Get aspect ratings summary for a cafe
     */
    @Query("SELECT AVG(r.aspects.food), AVG(r.aspects.service), AVG(r.aspects.ambiance), AVG(r.aspects.value) " +
           "FROM Rating r WHERE r.cafe = :cafe AND r.aspects IS NOT NULL")
    Object[] findAspectRatingsSummaryByCafe(@Param("cafe") Cafe cafe);
}