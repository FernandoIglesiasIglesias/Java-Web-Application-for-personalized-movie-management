package com.tfg.tfg.model.entities;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for Actor entities.
 */
@Repository
public interface ActorDao extends JpaRepository<Actor, Long> {
}