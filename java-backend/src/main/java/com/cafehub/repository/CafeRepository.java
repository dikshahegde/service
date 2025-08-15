package com.cafehub.repository;

import com.cafehub.model.Cafe;
import com.cafehub.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface CafeRepository extends JpaRepository<Cafe, Long> {

    /**
     * Find cafes by owner
     */
    List<Cafe> findByOwner(User owner);

    /**
     * Find cafes by owner and active status
     */
    List<Cafe> findByOwnerAndIsActive(User owner, Boolean isActive);

    /**
     * Find active cafes
     */
    List<Cafe> findByIsActiveTrue();

    /**
     * Find active cafes with pagination
     */
    Page<Cafe> findByIsActiveTrue(Pageable pageable);

    /**
     * Find cafes by city (case insensitive)
     */
    @Query("SELECT c FROM Cafe c WHERE c.isActive = true AND LOWER(c.location.city) = LOWER(:city)")
    Page<Cafe> findByCityIgnoreCase(@Param("city") String city, Pageable pageable);

    /**
     * Find cafes by state (case insensitive)
     */
    @Query("SELECT c FROM Cafe c WHERE c.isActive = true AND LOWER(c.location.state) = LOWER(:state)")
    Page<Cafe> findByStateIgnoreCase(@Param("state") String state, Pageable pageable);

    /**
     * Find cafes by city and state
     */
    @Query("SELECT c FROM Cafe c WHERE c.isActive = true AND LOWER(c.location.city) = LOWER(:city) AND LOWER(c.location.state) = LOWER(:state)")
    Page<Cafe> findByCityAndStateIgnoreCase(@Param("city") String city, @Param("state") String state, Pageable pageable);

    /**
     * Find cafes within budget range
     */
    @Query("SELECT c FROM Cafe c WHERE c.isActive = true AND c.averageBudget.min >= :minBudget AND c.averageBudget.max <= :maxBudget")
    Page<Cafe> findByBudgetRange(@Param("minBudget") BigDecimal minBudget, @Param("maxBudget") BigDecimal maxBudget, Pageable pageable);

    /**
     * Search cafes by name or description
     */
    @Query("SELECT c FROM Cafe c WHERE c.isActive = true AND " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(c.location.city) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<Cafe> searchCafes(@Param("searchTerm") String searchTerm, Pageable pageable);

    /**
     * Find cafes with specific amenities
     */
    @Query("SELECT c FROM Cafe c JOIN c.amenities a WHERE c.isActive = true AND a IN :amenities GROUP BY c HAVING COUNT(a) = :amenityCount")
    Page<Cafe> findByAmenities(@Param("amenities") List<Cafe.Amenity> amenities, @Param("amenityCount") long amenityCount, Pageable pageable);

    /**
     * Find top rated cafes
     */
    @Query("SELECT c FROM Cafe c WHERE c.isActive = true ORDER BY c.averageRating DESC, c.ratingCount DESC")
    Page<Cafe> findTopRatedCafes(Pageable pageable);

    /**
     * Find newest cafes
     */
    @Query("SELECT c FROM Cafe c WHERE c.isActive = true ORDER BY c.createdAt DESC")
    Page<Cafe> findNewestCafes(Pageable pageable);

    /**
     * Complex search with multiple filters
     */
    @Query("SELECT DISTINCT c FROM Cafe c LEFT JOIN c.amenities a WHERE c.isActive = true " +
           "AND (:city IS NULL OR LOWER(c.location.city) LIKE LOWER(CONCAT('%', :city, '%'))) " +
           "AND (:state IS NULL OR LOWER(c.location.state) LIKE LOWER(CONCAT('%', :state, '%'))) " +
           "AND (:minBudget IS NULL OR c.averageBudget.min >= :minBudget) " +
           "AND (:maxBudget IS NULL OR c.averageBudget.max <= :maxBudget) " +
           "AND (:searchTerm IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "     OR LOWER(c.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
           "AND (:amenities IS NULL OR :amenities IS EMPTY OR a IN :amenities)")
    Page<Cafe> findWithFilters(@Param("city") String city,
                              @Param("state") String state,
                              @Param("minBudget") BigDecimal minBudget,
                              @Param("maxBudget") BigDecimal maxBudget,
                              @Param("searchTerm") String searchTerm,
                              @Param("amenities") List<Cafe.Amenity> amenities,
                              Pageable pageable);

    /**
     * Count cafes by city
     */
    @Query("SELECT COUNT(c) FROM Cafe c WHERE c.isActive = true AND LOWER(c.location.city) = LOWER(:city)")
    long countByCityIgnoreCase(@Param("city") String city);

    /**
     * Find cafes near coordinates (simple distance calculation)
     */
    @Query("SELECT c FROM Cafe c WHERE c.isActive = true AND " +
           "ABS(c.location.latitude - :latitude) <= :latRange AND " +
           "ABS(c.location.longitude - :longitude) <= :lngRange")
    Page<Cafe> findNearLocation(@Param("latitude") BigDecimal latitude,
                               @Param("longitude") BigDecimal longitude,
                               @Param("latRange") BigDecimal latRange,
                               @Param("lngRange") BigDecimal lngRange,
                               Pageable pageable);
}