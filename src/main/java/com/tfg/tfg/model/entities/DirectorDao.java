package com.tfg.tfg.model.entities;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for Director entities.
 */
@Repository
public interface DirectorDao extends JpaRepository<Director, Long> {

    Optional<Director> findByName(String name);
    
    Optional<Director> findByImdbId(String imdbId);

}