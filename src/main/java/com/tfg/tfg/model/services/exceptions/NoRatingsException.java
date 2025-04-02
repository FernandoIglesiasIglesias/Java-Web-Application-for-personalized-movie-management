package com.tfg.tfg.model.services.exceptions;

public class NoRatingsException extends Exception {

    private static final long serialVersionUID = 1L;

    public NoRatingsException(String message) {
        super(message);
    }
}