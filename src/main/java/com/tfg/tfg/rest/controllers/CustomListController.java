package com.tfg.tfg.rest.controllers;

import java.util.List;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
import com.tfg.tfg.model.services.CustomListService;
import com.tfg.tfg.model.services.MovieService;
import com.tfg.tfg.model.services.exceptions.DuplicateInstanceException;
import com.tfg.tfg.model.services.exceptions.IncorrectLoginException;
import com.tfg.tfg.model.services.exceptions.InstanceNotFoundException;
import com.tfg.tfg.model.services.exceptions.PermissionException;
import com.tfg.tfg.rest.common.ErrorsDto;
import com.tfg.tfg.rest.dtos.CustomListConversor;
import com.tfg.tfg.rest.dtos.CustomListDto;
import com.tfg.tfg.rest.dtos.MovieConversor;
import com.tfg.tfg.rest.dtos.MovieDto;

@RestController
@RequestMapping("/lists")
public class CustomListController {
    
    private static final String INSTANCE_NOT_FOUND_EXCEPTION_CODE = "project.exceptions.InstanceNotFoundException";
    private static final String PERMISSION_EXCEPTION_CODE = "project.exceptions.PermissionException";
    private static final String DUPLICATE_INSTANCE_EXCEPTION_CODE = "project.exceptions.DuplicateInstanceException";
    
    @Autowired
    private MessageSource messageSource;
    
    private final CustomListService customListService;
    private final MovieService movieService;
    
    public CustomListController(CustomListService customListService, MovieService movieService) {
        this.customListService = customListService;
        this.movieService = movieService;
    }
    
    @ExceptionHandler(InstanceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ResponseBody
    public ErrorsDto handleInstanceNotFoundException(InstanceNotFoundException exception, Locale locale) {
        String errorMessage = messageSource.getMessage(INSTANCE_NOT_FOUND_EXCEPTION_CODE, 
            null, INSTANCE_NOT_FOUND_EXCEPTION_CODE, locale);
        return new ErrorsDto(errorMessage);
    }
	    
    @ExceptionHandler(PermissionException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    @ResponseBody
    public ErrorsDto handlePermissionException(PermissionException exception, Locale locale) {
        String errorMessage = messageSource.getMessage(PERMISSION_EXCEPTION_CODE, null,
            PERMISSION_EXCEPTION_CODE, locale);
        return new ErrorsDto(errorMessage);
    }
    
    @ExceptionHandler(DuplicateInstanceException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    @ResponseBody
    public ErrorsDto handleDuplicateInstanceException(DuplicateInstanceException exception, Locale locale) {
        String errorMessage = messageSource.getMessage(DUPLICATE_INSTANCE_EXCEPTION_CODE, null,
            DUPLICATE_INSTANCE_EXCEPTION_CODE, locale);
        return new ErrorsDto(errorMessage);
    }
    
    @GetMapping
    public List<CustomListDto> getUserLists(@AuthenticationPrincipal Users user) throws InstanceNotFoundException {
        return CustomListConversor.toCustomListDtos(customListService.getUserLists(user.getId()));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CustomListDto> getList(@PathVariable Long id, @AuthenticationPrincipal Users user) 
            throws InstanceNotFoundException, PermissionException {
        CustomList list = customListService.getListById(id, user.getId());
        return ResponseEntity.ok(CustomListConversor.toCustomListDto(list));
    }
    
    @PostMapping
    public ResponseEntity<CustomListDto> createList(@RequestBody CustomListDto listDto, @AuthenticationPrincipal Users user) 
            throws DuplicateInstanceException {
        CustomList list = customListService.createList(listDto.getName(), user);
        return ResponseEntity.status(HttpStatus.CREATED).body(CustomListConversor.toCustomListDto(list));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<CustomListDto> updateList(@PathVariable Long id, @RequestBody CustomListDto listDto, 
            @AuthenticationPrincipal Users user) throws InstanceNotFoundException, PermissionException, DuplicateInstanceException {
        CustomList updatedList = customListService.updateListName(id, user.getId(), listDto.getName());
        return ResponseEntity.ok(CustomListConversor.toCustomListDto(updatedList));
    }
    
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteList(@PathVariable Long id, @AuthenticationPrincipal Users user) 
            throws InstanceNotFoundException, PermissionException {
        customListService.deleteList(id, user.getId());
    }

    @PostMapping("/{listId}/movies")
    public ResponseEntity<CustomListDto> addMovieToList(@PathVariable Long listId, @RequestBody MovieDto movieDto, 
            @AuthenticationPrincipal Users user) throws InstanceNotFoundException, PermissionException, DuplicateInstanceException {
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
    
    @DeleteMapping("/{listId}/movies/{movieId}")
    public ResponseEntity<CustomListDto> removeMovieFromList(@PathVariable Long listId, @PathVariable Long movieId, 
            @AuthenticationPrincipal Users user) throws InstanceNotFoundException, PermissionException {
        CustomList updatedList = customListService.removeMovieFromList(listId, user.getId(), movieId);
        return ResponseEntity.ok(CustomListConversor.toCustomListDto(updatedList));
    }
}