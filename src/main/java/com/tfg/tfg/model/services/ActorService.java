package com.tfg.tfg.model.services;

import com.tfg.tfg.model.entities.Actor;
import com.tfg.tfg.model.services.exceptions.InstanceNotFoundException;

import java.util.List;

/**
 * Service interface for Actor operations.
 */
public interface ActorService {
    
    /**
     * Updates an actor with new information.
     * The actor must already exist in the database and is identified by first and last name.
     *
     * @param actor the actor with updated information
     * @return the updated actor
     * @throws InstanceNotFoundException if the actor does not exist
     */
    public Actor updateActor(Actor actor) throws InstanceNotFoundException;
    
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
     * Finds an actor by imdb ID.
     *
     * @param imdbId the imdb ID of the actor
     * @return the actor if found
     * @throws InstanceNotFoundException if the actor is not found
     */
    public Actor findByImdbId(String imdbId) throws InstanceNotFoundException;
    
    /**
     * Gets all actors.
     *
     * @return a list of all actors
     */
    public List<Actor> getAllActors();
}