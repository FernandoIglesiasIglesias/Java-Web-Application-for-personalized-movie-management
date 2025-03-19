package com.tfg.tfg.model.services;

import java.util.List;

import com.tfg.tfg.model.entities.ActorList;
import com.tfg.tfg.model.services.exceptions.DuplicateListNameException;
import com.tfg.tfg.model.services.exceptions.EmptyUserListsException;
import com.tfg.tfg.model.services.exceptions.InstanceNotFoundException;

public interface ActorListService {

    /**
     * Creates a new actor list for a user
     * 
     * @param userId User ID
     * @param name List name
     * @return The created list
     * @throws InstanceNotFoundException If the user doesn't exist
     * @throws DuplicateListNameException If a list with that name already exists for the user
     */
    ActorList createActorList(Long userId, String name) 
        throws InstanceNotFoundException, DuplicateListNameException;
    
    /**
     * Gets all actor lists for a user
     * 
     * @param userId User ID
     * @return List of actor lists
     * @throws EmptyUserListsException If the user has no lists
     * @throws InstanceNotFoundException If the user doesn't exist
     */
    List<ActorList> getUserActorLists(Long userId) 
        throws EmptyUserListsException, InstanceNotFoundException;
    
    /**
     * Gets an actor list by its ID
     * 
     * @param listId List ID
     * @return The actor list
     * @throws InstanceNotFoundException If the list doesn't exist
     */
    ActorList getActorListById(Long listId) throws InstanceNotFoundException;
    
    /**
     * Updates the name of an actor list
     * 
     * @param listId List ID
     * @param newName New name for the list
     * @return The updated list
     * @throws InstanceNotFoundException If the list doesn't exist
     * @throws DuplicateListNameException If a list with that name already exists for the user
     */
    ActorList updateActorListName(Long listId, String newName) 
        throws InstanceNotFoundException, DuplicateListNameException;
    
    /**
     * Deletes an actor list
     * 
     * @param listId ID of the list to delete
     * @throws InstanceNotFoundException If the list doesn't exist
     */
    void deleteActorList(Long listId) throws InstanceNotFoundException;
    
    /**
     * Adds an actor to a list
     * 
     * @param listId List ID
     * @param actorId Actor ID
     * @return The updated list
     * @throws InstanceNotFoundException If the list or actor don't exist
     */
    ActorList addActorToList(Long listId, Long actorId) throws InstanceNotFoundException;
    
    /**
     * Removes an actor from a list
     * 
     * @param listId List ID
     * @param actorId Actor ID
     * @return The updated list
     * @throws InstanceNotFoundException If the list or actor don't exist
     */
    ActorList removeActorFromList(Long listId, Long actorId) throws InstanceNotFoundException;
    
}