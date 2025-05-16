package com.tfg.tfg.model.services.exceptions;

/**
 * Exception thrown when a user doesn't have any custom lists.
 */
@SuppressWarnings("serial")
public class EmptyUserListsException extends Exception {
    
    private final Long userId;

    public EmptyUserListsException(Long userId) {
        this.userId = userId;
    }
    
    public Long getUserId() {
        return userId;
    }
}