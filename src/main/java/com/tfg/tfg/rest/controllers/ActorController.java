package com.tfg.tfg.rest.controllers;

import com.tfg.tfg.model.entities.Actor;
import com.tfg.tfg.model.entities.ActorDao;
import com.tfg.tfg.model.services.ActorService;
import com.tfg.tfg.model.services.exceptions.InstanceNotFoundException;
import com.tfg.tfg.rest.common.ErrorsDto;
import com.tfg.tfg.rest.dtos.ActorConversor;
import com.tfg.tfg.rest.dtos.ActorDto;

import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/actors")
public class ActorController {

    private static final String INSTANCE_NOT_FOUND_EXCEPTION_CODE = "project.exceptions.InstanceNotFoundException";
    
    private final ActorService actorService;
    private final MessageSource messageSource;

    /**
     * Constructor with dependency injection.
     *
     * @param actorService the service for actor operations
     * @param messageSource source for localized messages
     */
    public ActorController(ActorService actorService, MessageSource messageSource) {
        this.actorService = actorService;
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
     * Endpoint to get all actors.
     *
     * @return a list of all actors
     */
    @GetMapping("/all")
    public List<ActorDto> getAllActors() {
        return actorService.getAllActors().stream()
                .map(ActorConversor::toActorDto)
                .toList();
    }

    /**
     * Endpoint to get an actor by ID.
     *
     * @param id the actor's ID
     * @return the actor if found
     * @throws InstanceNotFoundException if the actor is not found
     */
    @GetMapping("/{id}")
    public ActorDto getActorById(@PathVariable Long id) throws InstanceNotFoundException {
        return ActorConversor.toActorDto(actorService.findById(id));
    }

    /**
     * Endpoint to get an actor by IMDB ID.
     *
     * @param imdbId the actor's IMDB ID
     * @return the actor if found, or a 404 status if not found
     */
    @GetMapping("/imdb/{imdbId}")
    public ResponseEntity<ActorDto> getActorByImdbId(@PathVariable String imdbId) {
        try {
            Actor actor = actorService.findByImdbId(imdbId);
            return ResponseEntity.ok(ActorConversor.toActorDtoExpanded(actor));
        } catch (InstanceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Endpoint to get an actor by first name and last name.
     *
     * @param firstName the actor's first name
     * @param lastName the actor's last name
     * @return the actor if found
     * @throws InstanceNotFoundException if the actor is not found
     */
    @GetMapping("/name")
    public ActorDto getActorByName(
            @RequestParam String firstName, 
            @RequestParam String lastName) throws InstanceNotFoundException {
        
        return ActorConversor.toActorDto(actorService.findByFirstNameAndLastName(firstName, lastName));
    }

    /**
     * Endpoint to update an actor by name.
     *
     * @param firstName the first name of the actor
     * @param lastName the last name of the actor
     * @param actorDto the actor data transfer object with updated information
     * @return the updated actor
     * @throws InstanceNotFoundException if the actor is not found
     */
    @PutMapping("/name/{firstName}/{lastName}")
    public ActorDto updateActorByName(
            @PathVariable String firstName, 
            @PathVariable String lastName, 
            @RequestBody ActorDto actorDto) throws InstanceNotFoundException {
        
        // Ensure the name in the path matches the one in the DTO
        actorDto.setFirstName(firstName);
        actorDto.setLastName(lastName);
        
        Actor actor = ActorConversor.toActor(actorDto);
        Actor updatedActor = actorService.updateActor(actor);
        return ActorConversor.toActorDto(updatedActor);
    }

}