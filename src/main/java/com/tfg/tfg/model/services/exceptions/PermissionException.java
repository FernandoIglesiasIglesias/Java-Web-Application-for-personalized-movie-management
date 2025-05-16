package com.tfg.tfg.model.services.exceptions;

@SuppressWarnings("serial")
public class PermissionException extends Exception {
    
    public PermissionException() {
        super();
    }
    
    public PermissionException(String message) {
        super(message);
    }
    
}