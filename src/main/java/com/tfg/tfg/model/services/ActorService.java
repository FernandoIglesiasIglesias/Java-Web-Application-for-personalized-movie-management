package com.tfg.tfg.model.services;

import com.tfg.tfg.model.entities.Actor;
import com.tfg.tfg.model.services.exceptions.InstanceNotFoundException;

import java.util.List;

/**
 * Service interface for Actor operations.
 */
public interface ActorService {
    
    /**
     * Creates or updates an actor.
     *
     * @param actor the actor to create or update
     * @return the saved actor
     */
    public Actor createOrUpdateActor(Actor actor);
    
    /**
     * Finds an actor by ID.
     *
     * @param id the ID of the actor
     * @return the actor if found
     * @throws InstanceNotFoundException if the actor is not found
     */
    public Actor findById(Long id) throws InstanceNotFoundException;
    
    /**
     * Finds an actor by first and last name.
     *
     * @param firstName the first name of the actor
     * @param lastName the last name of the actor
     * @return the actor if found
     * @throws InstanceNotFoundException if the actor is not found
     */
    public Actor findByFirstNameAndLastName(String firstName, String lastName) throws InstanceNotFoundException;
    
    /**
     * Finds an actor by TMDB ID.
     *
     * @param tmdbId the TMDB ID of the actor
     * @return the actor if found
     * @throws InstanceNotFoundException if the actor is not found
     */
    public Actor findByTmdbId(String tmdbId) throws InstanceNotFoundException;
    
    /**
     * Gets all actors.
     *
     * @return a list of all actors
     */
    public List<Actor> getAllActors();
}