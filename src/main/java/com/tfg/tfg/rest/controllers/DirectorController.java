package com.tfg.tfg.rest.controllers;

import com.tfg.tfg.model.entities.Actor;
import com.tfg.tfg.model.entities.Director;
import com.tfg.tfg.model.services.DirectorService;
import com.tfg.tfg.model.services.exceptions.InstanceNotFoundException;
import com.tfg.tfg.rest.common.ErrorsDto;
import com.tfg.tfg.rest.dtos.DirectorConversor;
import com.tfg.tfg.rest.dtos.DirectorDto;

import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/directors")
public class DirectorController {

    private static final String INSTANCE_NOT_FOUND_EXCEPTION_CODE = "project.exceptions.InstanceNotFoundException";
    
    private final DirectorService directorService;
    private final MessageSource messageSource;

    /**
     * Constructor with dependency injection.
     *
     * @param directorService the service for director operations
     * @param messageSource source for localized messages
     */
    public DirectorController(DirectorService directorService, MessageSource messageSource) {
        this.directorService = directorService;
        this.messageSource = messageSource;
    }

    /**
     * Error handler for InstanceNotFoundException.
     *
     * @param exception the exception that occurred
     * @param locale the current locale
     * @return an error response with appropriate message
     */
    @ExceptionHandler(InstanceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ResponseBody
    public ErrorsDto handleInstanceNotFoundException(InstanceNotFoundException exception, Locale locale) {
        String errorMessage = messageSource.getMessage(
                INSTANCE_NOT_FOUND_EXCEPTION_CODE, null, 
                INSTANCE_NOT_FOUND_EXCEPTION_CODE, 
                locale);
        
        return new ErrorsDto(errorMessage);
    }

    /**
     * Endpoint to get all directors.
     *
     * @return a list of all directors
     */
    @GetMapping("/all")
    public List<DirectorDto> getAllDirectors() {
        return directorService.getAllDirectors().stream()
                .map(DirectorConversor::toDirectorDto)
                .toList();
    }

    /**
     * Endpoint to get a director by ID.
     *
     * @param id the director's ID
     * @return the director if found
     * @throws InstanceNotFoundException if the director is not found
     */
    @GetMapping("/{id}")
    public DirectorDto getDirectorById(@PathVariable Long id) throws InstanceNotFoundException {
        return DirectorConversor.toDirectorDto(directorService.findById(id));
    }

    /**
     * Endpoint to get a director by IMDB ID.
     *
     * @param imdbId the director's IMDB ID
     * @return the director if found, or a 404 status if not found
     */
    @GetMapping("/imdb/{imdbId}")
    public ResponseEntity<DirectorDto> getDirectorByImdbId(@PathVariable String imdbId) {
        try {
            Director director = directorService.findByImdbId(imdbId);
            return ResponseEntity.ok(DirectorConversor.toDirectorDtoExpanded(director));
        } catch (InstanceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Endpoint to get a director by name.
     *
     * @param name the director's name
     * @return the director if found, or a 404 status if not found
     */
    @GetMapping("/name/{name}")
    public ResponseEntity<DirectorDto> getDirectorByName(@PathVariable String name) {
        try {
            Director director = directorService.findByName(name);
            return ResponseEntity.ok(DirectorConversor.toDirectorDtoExpanded(director));
        } catch (InstanceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Endpoint to create a new director.
     *
     * @param directorDto the director data transfer object with information to create
     * @return the created director
     */
    @PostMapping("/create")
    public ResponseEntity<Director> createDirector(@RequestBody DirectorDto directorDto) {
        Director createdDirector = directorService.createDirector(DirectorConversor.toDirector(directorDto));
        return new ResponseEntity<>(createdDirector, HttpStatus.CREATED);
    }

    /**
     * Endpoint to update a director by name.
     *
     * @param firstName the first name of the director
     * @param lastName the last name of the director
     * @param directorDto the director data transfer object with updated information
     * @return the updated director
     * @throws InstanceNotFoundException if the director is not found
     */
    @PutMapping("/name/{name}")
    public DirectorDto updateDirectorByName(
            @PathVariable String name, 
            @RequestBody DirectorDto directorDto) throws InstanceNotFoundException {
        
        directorDto.setName(name);
        
        Director director = DirectorConversor.toDirector(directorDto);
        Director updatedDirector = directorService.updateDirector(director);
        return DirectorConversor.toDirectorDto(updatedDirector);
    }
}