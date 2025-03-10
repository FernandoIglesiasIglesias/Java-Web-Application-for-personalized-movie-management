package com.tfg.tfg.rest.controllers;

import java.util.List;
import java.util.Locale;
import java.util.Optional;

import org.springframework.security.core.Authentication;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.tfg.tfg.model.entities.CustomList;
import com.tfg.tfg.model.entities.Movie;
import com.tfg.tfg.model.entities.Users;
import com.tfg.tfg.model.entities.UsersDao;
import com.tfg.tfg.model.services.CustomListService;
import com.tfg.tfg.model.services.MovieService;
import com.tfg.tfg.model.services.exceptions.DuplicateInstanceException;
import com.tfg.tfg.model.services.exceptions.DuplicateListNameException;
import com.tfg.tfg.model.services.exceptions.EmptyUserListsException;
import com.tfg.tfg.model.services.exceptions.InstanceNotFoundException;
import com.tfg.tfg.model.services.exceptions.MovieAlreadyInListException;
import com.tfg.tfg.model.services.exceptions.PermissionException;
import com.tfg.tfg.rest.common.ErrorsDto;
import com.tfg.tfg.rest.dtos.CustomListConversor;
import com.tfg.tfg.rest.dtos.CustomListDto;
import com.tfg.tfg.rest.dtos.MovieConversor;
import com.tfg.tfg.rest.dtos.MovieDto;

/**
 * REST controller for managing custom movie lists.
 * Provides endpoints for creating, retrieving, updating, and deleting lists,
 * as well as adding and removing movies from lists.
 */
@RestController
@RequestMapping("/lists")
public class CustomListController {
    
    private static final String INSTANCE_NOT_FOUND_EXCEPTION_CODE = "project.exceptions.InstanceNotFoundException";
    private static final String PERMISSION_EXCEPTION_CODE = "project.exceptions.PermissionException";
    private static final String DUPLICATE_INSTANCE_EXCEPTION_CODE = "project.exceptions.DuplicateInstanceException";
    private static final String EMPTY_USER_LISTS_EXCEPTION_CODE = "project.exceptions.EmptyUserListsException";
    private static final String DUPLICATE_LIST_NAME_EXCEPTION_CODE = "project.exceptions.DuplicateListNameException";
    private static final String MOVIE_ALREADY_IN_LIST_EXCEPTION_CODE = "project.exceptions.MovieAlreadyInListException";

    private final MessageSource messageSource;
    private final CustomListService customListService;
    private final MovieService movieService;
    private final UsersDao usersDao;
    
    /**
     * Constructor for CustomListController.
     * 
     * @param customListService Service for managing custom lists
     * @param movieService Service for managing movies
     * @param usersDao Data access object for user operations
     * @param messageSource Source for localized messages
     */
    public CustomListController(CustomListService customListService, MovieService movieService, UsersDao usersDao, MessageSource messageSource) {
        this.customListService = customListService;
        this.movieService = movieService;
        this.usersDao = usersDao;
        this.messageSource = messageSource;
    }
    
    /**
     * Retrieves the currently authenticated user.
     * 
     * @return The authenticated user entity
     * @throws InstanceNotFoundException if the user is not found in the database
     */
    private Users getCurrentUser() throws InstanceNotFoundException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        Optional<Users> user = usersDao.findByUserName(username);
        if (!user.isPresent()) {
            throw new InstanceNotFoundException("Users", username);
        }
        
        return user.get();
    }
    
    /**
     * Exception handler for InstanceNotFoundException.
     * 
     * @param exception The exception that was thrown
     * @param locale The current locale for message localization
     * @return ErrorsDto containing the error message
     */
    @ExceptionHandler(InstanceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ResponseBody
    public ErrorsDto handleInstanceNotFoundException(InstanceNotFoundException exception, Locale locale) {
        String errorMessage = messageSource.getMessage(INSTANCE_NOT_FOUND_EXCEPTION_CODE, 
            null, INSTANCE_NOT_FOUND_EXCEPTION_CODE, locale);
        return new ErrorsDto(errorMessage);
    }
        
    /**
     * Exception handler for PermissionException.
     * 
     * @param exception The exception that was thrown
     * @param locale The current locale for message localization
     * @return ErrorsDto containing the error message
     */
    @ExceptionHandler(PermissionException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    @ResponseBody
    public ErrorsDto handlePermissionException(PermissionException exception, Locale locale) {
        String errorMessage = messageSource.getMessage(PERMISSION_EXCEPTION_CODE, null,
            PERMISSION_EXCEPTION_CODE, locale);
        return new ErrorsDto(errorMessage);
    }
    
    /**
     * Exception handler for DuplicateInstanceException.
     * 
     * @param exception The exception that was thrown
     * @param locale The current locale for message localization
     * @return ErrorsDto containing the error message
     */
    @ExceptionHandler(DuplicateInstanceException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    @ResponseBody
    public ErrorsDto handleDuplicateInstanceException(DuplicateInstanceException exception, Locale locale) {
        String errorMessage = messageSource.getMessage(DUPLICATE_INSTANCE_EXCEPTION_CODE, null,
            DUPLICATE_INSTANCE_EXCEPTION_CODE, locale);
        return new ErrorsDto(errorMessage);
    }

    /**
     * Exception handler for EmptyUserListsException.
     * 
     * @param exception The exception that was thrown
     * @param locale The current locale for message localization
     * @return ErrorsDto containing the error message
     */
    @ExceptionHandler(EmptyUserListsException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ResponseBody
    public ErrorsDto handleEmptyUserListsException(EmptyUserListsException exception, Locale locale) {
        String errorMessage = messageSource.getMessage(EMPTY_USER_LISTS_EXCEPTION_CODE, 
            new Object[] {exception.getUserId()}, EMPTY_USER_LISTS_EXCEPTION_CODE, locale);
        return new ErrorsDto(errorMessage);
    }

    /**
     * Exception handler for DuplicateListNameException.
     * 
     * @param exception The exception that was thrown
     * @param locale The current locale for message localization
     * @return ErrorsDto containing the error message
     */
    @ExceptionHandler(DuplicateListNameException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    @ResponseBody
    public ErrorsDto handleDuplicateListNameException(DuplicateListNameException exception, Locale locale) {
        String errorMessage = messageSource.getMessage(DUPLICATE_LIST_NAME_EXCEPTION_CODE, 
            new Object[] {exception.getListName(), exception.getUserId()},
            DUPLICATE_LIST_NAME_EXCEPTION_CODE, locale);
        return new ErrorsDto(errorMessage);
    }

    /**
     * Exception handler for MovieAlreadyInListException.
     * 
     * @param exception The exception that was thrown
     * @param locale The current locale for message localization
     * @return ErrorsDto containing the error message
     */
    @ExceptionHandler(MovieAlreadyInListException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    @ResponseBody
    public ErrorsDto handleMovieAlreadyInListException(MovieAlreadyInListException exception, Locale locale) {
        String errorMessage = messageSource.getMessage(MOVIE_ALREADY_IN_LIST_EXCEPTION_CODE, 
            new Object[] {exception.getMovieTitle(), exception.getListName()},
            MOVIE_ALREADY_IN_LIST_EXCEPTION_CODE, locale);
        return new ErrorsDto(errorMessage);
    }

    /**
     * Get all lists belonging to the authenticated user.
     * 
     * @return List of CustomListDto objects representing the user's lists
     * @throws InstanceNotFoundException if the user is not found
     * @throws EmptyUserListsException if the user has no lists
     */
    @GetMapping
    public List<CustomListDto> getUserLists() throws InstanceNotFoundException, EmptyUserListsException {
        Users user = getCurrentUser();
        return CustomListConversor.toCustomListDtos(customListService.getUserLists(user.getId()));
    }
    
    /**
     * Get a specific list by ID.
     * 
     * @param id The ID of the list to retrieve
     * @return ResponseEntity containing the requested CustomListDto
     * @throws InstanceNotFoundException if the list is not found
     * @throws PermissionException if the list doesn't belong to the authenticated user
     */
    @GetMapping("/{id}")
    public ResponseEntity<CustomListDto> getList(@PathVariable Long id) 
            throws InstanceNotFoundException, PermissionException {
        Users user = getCurrentUser();
        CustomList list = customListService.getListById(id, user.getId());
        return ResponseEntity.ok(CustomListConversor.toCustomListDto(list));
    }
    
    /**
     * Create a new custom list.
     * 
     * @param listDto DTO containing the details for the new list
     * @return ResponseEntity containing the created CustomListDto
     * @throws DuplicateListNameException if a list with the same name already exists for this user
     * @throws InstanceNotFoundException if the user is not found
     */
    @PostMapping
    public ResponseEntity<CustomListDto> createList(@RequestBody CustomListDto listDto) 
            throws DuplicateListNameException, InstanceNotFoundException {
        Users user = getCurrentUser();
        CustomList list = customListService.createList(listDto.getName(), user);
        return ResponseEntity.status(HttpStatus.CREATED).body(CustomListConversor.toCustomListDto(list));
    }
    
    /**
     * Update the name of an existing list.
     * 
     * @param id The ID of the list to update
     * @param listDto DTO containing the new list details
     * @return ResponseEntity containing the updated CustomListDto
     * @throws InstanceNotFoundException if the list is not found
     * @throws PermissionException if the list doesn't belong to the authenticated user
     * @throws DuplicateListNameException if another list with the same name already exists for this user
     */
    @PutMapping("/{id}")
    public ResponseEntity<CustomListDto> updateList(@PathVariable Long id, @RequestBody CustomListDto listDto) 
            throws InstanceNotFoundException, PermissionException, DuplicateListNameException {
        Users user = getCurrentUser();
        CustomList updatedList = customListService.updateListName(id, user.getId(), listDto.getName());
        return ResponseEntity.ok(CustomListConversor.toCustomListDto(updatedList));
    }
    
    /**
     * Delete a specific list.
     * 
     * @param id The ID of the list to delete
     * @throws InstanceNotFoundException if the list is not found
     * @throws PermissionException if the list doesn't belong to the authenticated user
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteList(@PathVariable Long id) 
            throws InstanceNotFoundException, PermissionException {
        Users user = getCurrentUser();
        customListService.deleteList(id, user.getId());
    }

    /**
     * Add a movie to a list.
     * 
     * @param listId The ID of the list to add the movie to
     * @param movieDto DTO containing the movie details
     * @return ResponseEntity containing the updated CustomListDto
     * @throws InstanceNotFoundException if the list or movie is not found
     * @throws PermissionException if the list doesn't belong to the authenticated user
     * @throws MovieAlreadyInListException if the movie is already in the list
     */
    @PostMapping("/{listId}/movies")
    public ResponseEntity<CustomListDto> addMovieToList(@PathVariable Long listId, @RequestBody MovieDto movieDto) 
            throws InstanceNotFoundException, PermissionException, MovieAlreadyInListException {
        Users user = getCurrentUser();
        Movie movie;
        
        if (movieDto.getId() != null) {
            movie = movieService.getMovieById(movieDto.getId())
                .orElseThrow(() -> new InstanceNotFoundException("Movie", movieDto.getId()));
        } else {
            movie = movieService.saveMovie(MovieConversor.toMovie(movieDto));
        }
        
        CustomList updatedList = customListService.addMovieToList(listId, user.getId(), movie);
        return ResponseEntity.ok(CustomListConversor.toCustomListDto(updatedList));
    }
    
    /**
     * Remove a movie from a list.
     * 
     * @param listId The ID of the list to remove the movie from
     * @param movieId The ID of the movie to remove
     * @return ResponseEntity containing the updated CustomListDto
     * @throws InstanceNotFoundException if the list or movie is not found
     * @throws PermissionException if the list doesn't belong to the authenticated user
     */
    @DeleteMapping("/{listId}/movies/{movieId}")
    public ResponseEntity<CustomListDto> removeMovieFromList(@PathVariable Long listId, @PathVariable Long movieId) 
            throws InstanceNotFoundException, PermissionException {
        Users user = getCurrentUser();
        CustomList updatedList = customListService.removeMovieFromList(listId, user.getId(), movieId);
        return ResponseEntity.ok(CustomListConversor.toCustomListDto(updatedList));
    }
}