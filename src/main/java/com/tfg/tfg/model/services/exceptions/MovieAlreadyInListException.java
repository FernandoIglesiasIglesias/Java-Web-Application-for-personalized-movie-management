package com.tfg.tfg.model.services.exceptions;

/**
 * Exception thrown when trying to add a movie that is already in a custom list.
 */
@SuppressWarnings("serial")
public class MovieAlreadyInListException extends Exception {
    
    private final Long movieId;
    private final Long listId;
    private final String movieTitle;
    private final String listName;

    /**
     * Creates a new MovieAlreadyInListException.
     * 
     * @param movieId The ID of the movie that caused the duplicate
     * @param listId The ID of the list where the movie already exists
     * @param movieTitle The title of the movie
     * @param listName The name of the list
     */
    public MovieAlreadyInListException(Long movieId, Long listId, String movieTitle, String listName) {
        this.movieId = movieId;
        this.listId = listId;
        this.movieTitle = movieTitle;
        this.listName = listName;
    }
    
    /**
     * @return The ID of the movie that caused the duplicate
     */
    public Long getMovieId() {
        return movieId;
    }
    
    /**
     * @return The ID of the list where the movie already exists
     */
    public Long getListId() {
        return listId;
    }
    
    /**
     * @return The title of the movie
     */
    public String getMovieTitle() {
        return movieTitle;
    }
    
    /**
     * @return The name of the list
     */
    public String getListName() {
        return listName;
    }
}