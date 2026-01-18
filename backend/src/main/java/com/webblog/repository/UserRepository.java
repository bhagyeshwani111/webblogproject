package com.webblog.repository;

import com.webblog.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    
    /**
     * Safe query that fetches users without triggering lazy loading of relationships.
     * This prevents LazyInitializationException when mapping to DTOs.
     */
    @Query("SELECT u FROM User u ORDER BY u.id ASC")
    List<User> findAllUsersWithoutRelations();
}

