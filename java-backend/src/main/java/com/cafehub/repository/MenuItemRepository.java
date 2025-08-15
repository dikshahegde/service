package com.cafehub.repository;

import com.cafehub.model.Cafe;
import com.cafehub.model.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    /**
     * Find menu items by cafe
     */
    List<MenuItem> findByCafe(Cafe cafe);

    /**
     * Find menu items by cafe and category
     */
    List<MenuItem> findByCafeAndCategory(Cafe cafe, MenuItem.Category category);

    /**
     * Find menu items by cafe ordered by category and name
     */
    List<MenuItem> findByCafeOrderByCategoryAscNameAsc(Cafe cafe);

    /**
     * Find menu items by cafe and price range
     */
    @Query("SELECT m FROM MenuItem m WHERE m.cafe = :cafe AND m.price BETWEEN :minPrice AND :maxPrice")
    List<MenuItem> findByCafeAndPriceRange(@Param("cafe") Cafe cafe, 
                                          @Param("minPrice") BigDecimal minPrice, 
                                          @Param("maxPrice") BigDecimal maxPrice);

    /**
     * Search menu items by name or description
     */
    @Query("SELECT m FROM MenuItem m WHERE m.cafe = :cafe AND " +
           "(LOWER(m.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(m.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<MenuItem> searchMenuItems(@Param("cafe") Cafe cafe, @Param("searchTerm") String searchTerm);

    /**
     * Find cheapest items in a cafe
     */
    @Query("SELECT m FROM MenuItem m WHERE m.cafe = :cafe ORDER BY m.price ASC")
    List<MenuItem> findCheapestItems(@Param("cafe") Cafe cafe);

    /**
     * Find most expensive items in a cafe
     */
    @Query("SELECT m FROM MenuItem m WHERE m.cafe = :cafe ORDER BY m.price DESC")
    List<MenuItem> findMostExpensiveItems(@Param("cafe") Cafe cafe);

    /**
     * Get average price by category for a cafe
     */
    @Query("SELECT m.category, AVG(m.price) FROM MenuItem m WHERE m.cafe = :cafe GROUP BY m.category")
    List<Object[]> findAveragePriceByCategoryAndCafe(@Param("cafe") Cafe cafe);

    /**
     * Count menu items by category for a cafe
     */
    @Query("SELECT m.category, COUNT(m) FROM MenuItem m WHERE m.cafe = :cafe GROUP BY m.category")
    List<Object[]> countItemsByCategoryAndCafe(@Param("cafe") Cafe cafe);

    /**
     * Find menu items with images
     */
    @Query("SELECT m FROM MenuItem m WHERE m.cafe = :cafe AND m.image IS NOT NULL AND m.image != ''")
    List<MenuItem> findItemsWithImages(@Param("cafe") Cafe cafe);

    /**
     * Delete all menu items for a cafe
     */
    void deleteByCafe(Cafe cafe);
}