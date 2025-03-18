package com.tfg.tfg.model.entities;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for Actor entities.
 */
@Repository
public interface ActorDao extends JpaRepository<Actor, Long> {

    /**
     * Find an actor by their first and last name.
     * 
     * @param firstName The actor's first name
     * @param lastName The actor's last name
     * @return The actor if found, empty otherwise
     */
    Optional<Actor> findByFirstNameAndLastName(String firstName, String lastName);
    
    /**
     * Find an actor by their imdb ID.
     * 
     * @param imdbId The actor's imdb ID
     * @return The actor if found, empty otherwise
     */
    Optional<Actor> findByImdbId(String imdbId);
    
    /**
     * Find all actors
     * 
     * @return a list of all actors
     */
    List<Actor> findAll();

}