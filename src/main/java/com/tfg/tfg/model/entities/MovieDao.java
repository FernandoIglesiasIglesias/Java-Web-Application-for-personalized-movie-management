package com.tfg.tfg.model.entities;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for Movie entities.
 */
@Repository
public interface MovieDao extends JpaRepository<Movie, Long> {
    Optional<Movie> findByImdbId(String imdbId);
}