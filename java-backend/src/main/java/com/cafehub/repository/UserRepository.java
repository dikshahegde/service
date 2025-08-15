package com.cafehub.repository;

import com.cafehub.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find user by email address
     */
    Optional<User> findByEmail(String email);

    /**
     * Check if user exists by email
     */
    boolean existsByEmail(String email);

    /**
     * Find users by role
     */
    List<User> findByRole(User.Role role);

    /**
     * Find users by name containing (case insensitive)
     */
    @Query("SELECT u FROM User u WHERE LOWER(u.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<User> findByNameContainingIgnoreCase(@Param("name") String name);

    /**
     * Find cafe owners who have at least one cafe
     */
    @Query("SELECT DISTINCT u FROM User u WHERE u.role = 'OWNER' AND SIZE(u.ownedCafes) > 0")
    List<User> findOwnersWithCafes();

    /**
     * Count users by role
     */
    long countByRole(User.Role role);
}