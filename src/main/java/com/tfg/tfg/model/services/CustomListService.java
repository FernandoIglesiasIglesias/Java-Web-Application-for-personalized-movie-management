package com.tfg.tfg.model.services;

import java.util.List;

import com.tfg.tfg.model.entities.CustomList;
import com.tfg.tfg.model.entities.Movie;
import com.tfg.tfg.model.entities.Users;
import com.tfg.tfg.model.services.exceptions.InstanceNotFoundException;
import com.tfg.tfg.model.services.exceptions.MovieAlreadyInListException;
import com.tfg.tfg.model.services.exceptions.PermissionException;
import com.tfg.tfg.model.services.exceptions.DuplicateListNameException;
import com.tfg.tfg.model.services.exceptions.EmptyUserListsException;

public interface CustomListService {
    
    /**
     * Create a new custom list
     * @param name Name of the list
     * @param user Owner user
     * @return Created list
     * @throws DuplicateListNameException if a list with the same name already exists for this user
     */
    CustomList createList(String name, Users user) throws DuplicateListNameException;
    
    /**
     * Get all lists of a user
     * @param userId ID of the user
     * @return List of custom lists
     * @throws InstanceNotFoundException if the user doesn't exist
     * @throws EmptyUserListsException if the user doesn't have any lists
     */
    List<CustomList> getUserLists(Long userId) throws InstanceNotFoundException , EmptyUserListsException;
    
    /**
     * Get a specific list
     * @param listId ID of the list
     * @param userId ID of the user (for verification)
     * @return List if it exists and belongs to the user
     * @throws InstanceNotFoundException if the list doesn't exist
     * @throws PermissionException if the list doesn't belong to the user
     */
    CustomList getListById(Long listId, Long userId) throws InstanceNotFoundException, PermissionException;
    
    /**
     * Update the name of the list
     * @param listId ID of the list
     * @param userId ID of the user
     * @param newName New name
     * @return Updated list
     * @throws InstanceNotFoundException if the list doesn't exist
     * @throws PermissionException if the list doesn't belong to the user
     * @throws DuplicateListNameException if another list with the same name already exists for this user
     */
    CustomList updateListName(Long listId, Long userId, String newName) 
        throws InstanceNotFoundException, PermissionException, DuplicateListNameException;

    /**
     * Delete a list
     * @param listId ID of the list
     * @param userId ID of the user
     * @throws InstanceNotFoundException if the list doesn't exist
     * @throws PermissionException if the list doesn't belong to the user
     */
    void deleteList(Long listId, Long userId) throws InstanceNotFoundException, PermissionException;
    
    /**
     * Add a movie to a list
     * @param listId ID of the list
     * @param userId ID of the user
     * @param movie Movie to add
     * @return Updated list
     * @throws InstanceNotFoundException if the list doesn't exist
     * @throws PermissionException if the list doesn't belong to the user
     * @throws MovieAlreadyInListException if the movie is already in the list
     */
    CustomList addMovieToList(Long listId, Long userId, Movie movie) 
        throws InstanceNotFoundException, PermissionException, MovieAlreadyInListException;
    
    /**
     * Remove a movie from a list
     * @param listId ID of the list
     * @param userId ID of the user
     * @param movieId ID of the movie
     * @return Updated list
     * @throws InstanceNotFoundException if the list or movie doesn't exist
     * @throws PermissionException if the list doesn't belong to the user
     */
    CustomList removeMovieFromList(Long listId, Long userId, Long movieId) 
        throws InstanceNotFoundException, PermissionException;
}