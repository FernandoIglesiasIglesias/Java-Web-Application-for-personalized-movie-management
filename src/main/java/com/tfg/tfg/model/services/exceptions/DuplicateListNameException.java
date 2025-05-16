package com.tfg.tfg.model.services.exceptions;

/**
 * Exception thrown when trying to create a list with a name that already exists for a user.
 */
@SuppressWarnings("serial")
public class DuplicateListNameException extends Exception {
    
    private final String listName;
    private final Long userId;

    /**
     * Creates a new DuplicateListNameException.
     * 
     * @param listName The duplicate list name
     * @param userId The ID of the user who owns the existing list
     */
    public DuplicateListNameException(String listName, Long userId) {
        this.listName = listName;
        this.userId = userId;
    }
    
    /**
     * @return The name of the list that caused the duplicate
     */
    public String getListName() {
        return listName;
    }
    
    /**
     * @return The ID of the user who owns the existing list
     */
    public Long getUserId() {
        return userId;
    }
}