package com.tfg.tfg.rest.controllers;

import java.util.List;
import java.util.Locale;

import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
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

import com.tfg.tfg.model.entities.ActorList;
import com.tfg.tfg.model.services.ActorListService;
import com.tfg.tfg.model.services.exceptions.DuplicateListNameException;
import com.tfg.tfg.model.services.exceptions.EmptyUserListsException;
import com.tfg.tfg.model.services.exceptions.InstanceNotFoundException;
import com.tfg.tfg.rest.common.ErrorsDto;
import com.tfg.tfg.rest.dtos.ActorListConversor;
import com.tfg.tfg.rest.dtos.ActorListDto;

@RestController
@RequestMapping("/actor-lists")
public class ActorListController {
    
    private static final String INSTANCE_NOT_FOUND_EXCEPTION_CODE = "project.exceptions.InstanceNotFoundException";
    private static final String DUPLICATE_ACTOR_LIST_NAME_EXCEPTION_CODE = "project.exceptions.DuplicateListNameException";
    private static final String EMPTY_ACTOR_LISTS_EXCEPTION_CODE = "project.exceptions.EmptyUserListsException";
    
    private final ActorListService actorListService;
    private final MessageSource messageSource;
    
    public ActorListController(ActorListService actorListService, MessageSource messageSource) {
        this.actorListService = actorListService;
        this.messageSource = messageSource;
    }
    
    @ExceptionHandler(InstanceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ResponseBody
    public ErrorsDto handleInstanceNotFoundException(InstanceNotFoundException exception, Locale locale) {
        String errorMessage = messageSource.getMessage(
                INSTANCE_NOT_FOUND_EXCEPTION_CODE, null,
                INSTANCE_NOT_FOUND_EXCEPTION_CODE, locale);
        
        return new ErrorsDto(errorMessage);
    }
    
    @ExceptionHandler(DuplicateListNameException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ResponseBody
    public ErrorsDto handleDuplicateListNameException(DuplicateListNameException exception, Locale locale) {
        String errorMessage = messageSource.getMessage(
                DUPLICATE_ACTOR_LIST_NAME_EXCEPTION_CODE, null,
                DUPLICATE_ACTOR_LIST_NAME_EXCEPTION_CODE, locale);
        
        return new ErrorsDto(errorMessage);
    }
    
    @ExceptionHandler(EmptyUserListsException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ResponseBody
    public ErrorsDto handleEmptyUserListsException(EmptyUserListsException exception, Locale locale) {
        String errorMessage = messageSource.getMessage(
                EMPTY_ACTOR_LISTS_EXCEPTION_CODE, null,
                EMPTY_ACTOR_LISTS_EXCEPTION_CODE, locale);
        
        return new ErrorsDto(errorMessage);
    }
    
    @GetMapping("/user/{userId}")
    public List<ActorListDto> getUserActorLists(@PathVariable Long userId) 
            throws EmptyUserListsException, InstanceNotFoundException {
        
        List<ActorList> actorLists = actorListService.getUserActorLists(userId);
        return ActorListConversor.toActorListDtos(actorLists);
    }

    @GetMapping("/{listId}")
    public ActorListDto getActorListById(@PathVariable Long listId) throws InstanceNotFoundException {
        ActorList actorList = actorListService.getActorListById(listId);
        return ActorListConversor.toActorListDtoWithActors(actorList);
    }

    @PostMapping("")
    @ResponseStatus(HttpStatus.CREATED)
    public ActorListDto createActorList(@RequestBody ActorListDto actorListDto) 
            throws InstanceNotFoundException, DuplicateListNameException {
        
        ActorList actorList = actorListService.createActorList(actorListDto.getUserId(), actorListDto.getName());
        return ActorListConversor.toActorListDto(actorList);
    }

    @PutMapping("/{listId}")
    public ActorListDto updateActorList(@PathVariable Long listId, @RequestBody ActorListDto actorListDto) 
            throws InstanceNotFoundException, DuplicateListNameException {
        
        ActorList actorList = actorListService.updateActorListName(listId, actorListDto.getName());
        return ActorListConversor.toActorListDto(actorList);
    }

    @DeleteMapping("/{listId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteActorList(@PathVariable Long listId) throws InstanceNotFoundException {
        actorListService.deleteActorList(listId);
    }

    @PostMapping("/{listId}/actors/{actorId}")
    public ActorListDto addActorToList(@PathVariable Long listId, @PathVariable Long actorId) 
            throws InstanceNotFoundException {
        
        ActorList actorList = actorListService.addActorToList(listId, actorId);
        return ActorListConversor.toActorListDtoWithActors(actorList);
    }

    @DeleteMapping("/{listId}/actors/{actorId}")
    public ActorListDto removeActorFromList(@PathVariable Long listId, @PathVariable Long actorId) 
            throws InstanceNotFoundException {
        
        ActorList actorList = actorListService.removeActorFromList(listId, actorId);
        return ActorListConversor.toActorListDtoWithActors(actorList);
    }
}