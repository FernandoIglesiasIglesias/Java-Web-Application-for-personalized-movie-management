package com.tfg.tfg.model.services;

import java.util.List;

import com.tfg.tfg.model.entities.Director;
import com.tfg.tfg.model.services.exceptions.InstanceNotFoundException;

public interface DirectorService {
    
    /**
     * Updates an existing director in the system.
     *
     * @param director The director object with updated information
     * @return The updated director entity
     * @throws InstanceNotFoundException If the director to update does not exist
     */
    Director updateDirector(Director director) throws InstanceNotFoundException;

    /**
     * Finds a director by their unique identifier.
     *
     * @param id The unique identifier of the director
     * @return The director entity if found
     * @throws InstanceNotFoundException If no director with the given ID exists
     */
    Director findById(Long id) throws InstanceNotFoundException;
    
    /**
     * Finds a director by their first and last name.
     *
     * @param name The name of the director
     * @return The director entity if found
     * @throws InstanceNotFoundException If no director with the given name exists
     */
    Director findByName(String name) throws InstanceNotFoundException;

    /**
     * Finds a director by their IMDB identifier.
     *
     * @param imdbId The IMDB ID of the director
     * @return The director entity if found
     * @throws InstanceNotFoundException If no director with the given IMDB ID exists
     */
    Director findByImdbId(String imdbId) throws InstanceNotFoundException;

    /**
     * Retrieves all directors from the system.
     *
     * @return A list containing all director entities
     */   
    List<Director> getAllDirectors();

}