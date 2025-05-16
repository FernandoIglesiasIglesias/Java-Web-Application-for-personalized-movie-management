package com.tfg.tfg.model.services;

import java.util.List;

import com.tfg.tfg.model.entities.DirectorList;
import com.tfg.tfg.model.services.exceptions.DuplicateListNameException;
import com.tfg.tfg.model.services.exceptions.EmptyUserListsException;
import com.tfg.tfg.model.services.exceptions.InstanceNotFoundException;

public interface DirectorListService {

    /**
     * Creates a new director list for a user
     * 
     * @param userId User ID
     * @param name List name
     * @return The created list
     * @throws InstanceNotFoundException If the user doesn't exist
     * @throws DuplicateListNameException If a list with that name already exists for the user
     */
    DirectorList createDirectorList(Long userId, String name) 
        throws InstanceNotFoundException, DuplicateListNameException;
    
    /**
     * Gets all director lists for a user
     * 
     * @param userId User ID
     * @return List of director lists
     * @throws EmptyUserListsException If the user has no lists
     * @throws InstanceNotFoundException If the user doesn't exist
     */
    List<DirectorList> getUserDirectorLists(Long userId) 
        throws EmptyUserListsException, InstanceNotFoundException;
    
    /**
     * Gets a director list by its ID
     * 
     * @param listId List ID
     * @return The director list
     * @throws InstanceNotFoundException If the list doesn't exist
     */
    DirectorList getDirectorListById(Long listId) throws InstanceNotFoundException;
    
    /**
     * Updates the name of a director list
     * 
     * @param listId List ID
     * @param newName New name for the list
     * @return The updated list
     * @throws InstanceNotFoundException If the list doesn't exist
     * @throws DuplicateListNameException If a list with that name already exists for the user
     */
    DirectorList updateDirectorListName(Long listId, String newName) 
        throws InstanceNotFoundException, DuplicateListNameException;
    
    /**
     * Deletes a director list
     * 
     * @param listId ID of the list to delete
     * @throws InstanceNotFoundException If the list doesn't exist
     */
    void deleteDirectorList(Long listId) throws InstanceNotFoundException;
    
    /**
     * Adds a director to a list
     * 
     * @param listId List ID
     * @param directorId Director ID
     * @return The updated list
     * @throws InstanceNotFoundException If the list or director don't exist
     */
    DirectorList addDirectorToList(Long listId, Long directorId) throws InstanceNotFoundException;
    
    /**
     * Removes a director from a list
     * 
     * @param listId List ID
     * @param directorId Director ID
     * @return The updated list
     * @throws InstanceNotFoundException If the list or director don't exist
     */
    DirectorList removeDirectorFromList(Long listId, Long directorId) throws InstanceNotFoundException;
    
}