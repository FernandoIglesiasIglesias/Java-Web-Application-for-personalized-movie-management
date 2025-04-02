package com.tfg.tfg.model.services.exceptions;

public class InvalidRatingException extends Exception {

    private static final long serialVersionUID = 1L;

    public InvalidRatingException(String message) {
        super(message);
    }
    
}