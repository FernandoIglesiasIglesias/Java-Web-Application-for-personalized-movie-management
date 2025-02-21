package com.tfg.tfg.model.entities;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for Director entities.
 */
@Repository
public interface DirectorDao extends JpaRepository<Director, Long> {
}