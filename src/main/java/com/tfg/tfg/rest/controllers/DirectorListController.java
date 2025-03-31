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

import com.tfg.tfg.model.entities.DirectorList;
import com.tfg.tfg.model.services.DirectorListService;
import com.tfg.tfg.model.services.exceptions.DuplicateListNameException;
import com.tfg.tfg.model.services.exceptions.EmptyUserListsException;
import com.tfg.tfg.model.services.exceptions.InstanceNotFoundException;
import com.tfg.tfg.rest.common.ErrorsDto;
import com.tfg.tfg.rest.dtos.DirectorListConversor;
import com.tfg.tfg.rest.dtos.DirectorListDto;

@RestController
@RequestMapping("/director-lists")
public class DirectorListController {
    
    private static final String INSTANCE_NOT_FOUND_EXCEPTION_CODE = "project.exceptions.InstanceNotFoundException";
    private static final String DUPLICATE_DIRECTOR_LIST_NAME_EXCEPTION_CODE = "project.exceptions.DuplicateListNameException";
    private static final String EMPTY_DIRECTOR_LISTS_EXCEPTION_CODE = "project.exceptions.EmptyUserListsException";
    
    private final DirectorListService directorListService;
    private final MessageSource messageSource;
    
    public DirectorListController(DirectorListService directorListService, MessageSource messageSource) {
        this.directorListService = directorListService;
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
                DUPLICATE_DIRECTOR_LIST_NAME_EXCEPTION_CODE, null,
                DUPLICATE_DIRECTOR_LIST_NAME_EXCEPTION_CODE, locale);
        
        return new ErrorsDto(errorMessage);
    }
    
    @ExceptionHandler(EmptyUserListsException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ResponseBody
    public ErrorsDto handleEmptyUserListsException(EmptyUserListsException exception, Locale locale) {
        String errorMessage = messageSource.getMessage(
                EMPTY_DIRECTOR_LISTS_EXCEPTION_CODE, null,
                EMPTY_DIRECTOR_LISTS_EXCEPTION_CODE, locale);
        
        return new ErrorsDto(errorMessage);
    }
    
    @GetMapping("/user/{userId}")
    public List<DirectorListDto> getUserDirectorLists(@PathVariable Long userId) 
            throws EmptyUserListsException, InstanceNotFoundException {
        
        List<DirectorList> directorLists = directorListService.getUserDirectorLists(userId);
        return DirectorListConversor.toDirectorListDtos(directorLists);
    }

    @GetMapping("/{listId}")
    public DirectorListDto getDirectorListById(@PathVariable Long listId) throws InstanceNotFoundException {
        DirectorList directorList = directorListService.getDirectorListById(listId);
        return DirectorListConversor.toDirectorListDtoWithDirectors(directorList);
    }

    @PostMapping("")
    @ResponseStatus(HttpStatus.CREATED)
    public DirectorListDto createDirectorList(@RequestBody DirectorListDto directorListDto) 
            throws InstanceNotFoundException, DuplicateListNameException {
        
        DirectorList directorList = directorListService.createDirectorList(directorListDto.getUserId(), directorListDto.getName());
        return DirectorListConversor.toDirectorListDto(directorList);
    }

    @PutMapping("/{listId}")
    public DirectorListDto updateDirectorList(@PathVariable Long listId, @RequestBody DirectorListDto directorListDto) 
            throws InstanceNotFoundException, DuplicateListNameException {
        
        DirectorList directorList = directorListService.updateDirectorListName(listId, directorListDto.getName());
        return DirectorListConversor.toDirectorListDto(directorList);
    }

    @DeleteMapping("/{listId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteDirectorList(@PathVariable Long listId) throws InstanceNotFoundException {
        directorListService.deleteDirectorList(listId);
    }

    @PostMapping("/{listId}/directors/{directorId}")
    public DirectorListDto addDirectorToList(@PathVariable Long listId, @PathVariable Long directorId) 
            throws InstanceNotFoundException {
        
        DirectorList directorList = directorListService.addDirectorToList(listId, directorId);
        return DirectorListConversor.toDirectorListDtoWithDirectors(directorList);
    }

    @DeleteMapping("/{listId}/directors/{directorId}")
    public DirectorListDto removeDirectorFromList(@PathVariable Long listId, @PathVariable Long directorId) 
            throws InstanceNotFoundException {
        
        DirectorList directorList = directorListService.removeDirectorFromList(listId, directorId);
        return DirectorListConversor.toDirectorListDtoWithDirectors(directorList);
    }
}