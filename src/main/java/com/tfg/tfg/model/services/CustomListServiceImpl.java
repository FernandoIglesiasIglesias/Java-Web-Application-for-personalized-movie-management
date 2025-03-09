package com.tfg.tfg.model.services;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.tfg.tfg.model.entities.CustomList;
import com.tfg.tfg.model.entities.CustomListDao;
import com.tfg.tfg.model.entities.Movie;
import com.tfg.tfg.model.entities.MovieDao;
import com.tfg.tfg.model.entities.Users;
import com.tfg.tfg.model.services.exceptions.DuplicateInstanceException;
import com.tfg.tfg.model.services.exceptions.InstanceNotFoundException;
import com.tfg.tfg.model.services.exceptions.PermissionException;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class CustomListServiceImpl implements CustomListService {
    
    private static final String CUSTOM_LIST_ENTITY_NAME = "CustomList";

    private final CustomListDao customListDao;
    private final MovieDao movieDao;
    
    public CustomListServiceImpl(CustomListDao customListDao, MovieDao movieDao) {
        this.customListDao = customListDao;
        this.movieDao = movieDao;
    }
    
    @Override
    public CustomList createList(String name, Users user) throws DuplicateInstanceException {
        // Check for duplicates
        if (customListDao.findByNameAndUserId(name, user.getId()).isPresent()) {
            throw new DuplicateInstanceException(CUSTOM_LIST_ENTITY_NAME, name);
        }
        
        CustomList list = new CustomList(name, user);
        return customListDao.save(list);
    }
    
    @Override
    public List<CustomList> getUserLists(Long userId) throws InstanceNotFoundException {
        // You might want to verify if the user exists first
        List<CustomList> lists = customListDao.findByUserId(userId);
        
        if (lists == null || lists.isEmpty()) {
            throw new InstanceNotFoundException("Users", userId);
        }
        
        return lists;
    }
    
    @Override
    public CustomList getListById(Long listId, Long userId) 
            throws InstanceNotFoundException, PermissionException {
        Optional<CustomList> optionalList = customListDao.findById(listId);
        
        if (!optionalList.isPresent()) {
            throw new InstanceNotFoundException(CUSTOM_LIST_ENTITY_NAME, listId);
        }
        
        CustomList list = optionalList.get();
        if (!list.getUser().getId().equals(userId)) {
            throw new PermissionException();
        }
        
        return list;
    }
    
    @Override
    public CustomList updateListName(Long listId, Long userId, String newName) 
            throws InstanceNotFoundException, PermissionException, DuplicateInstanceException {
        // Check if list exists and belongs to user
        CustomList list = getListById(listId, userId);
        
        // Check for duplicate names
        if (customListDao.findByNameAndUserIdAndIdNot(newName, userId, listId).isPresent()) {
            throw new DuplicateInstanceException(CUSTOM_LIST_ENTITY_NAME, newName);
        }
        
        list.setName(newName);
        return customListDao.save(list);
    }
    
    @Override
    public void deleteList(Long listId, Long userId) 
            throws InstanceNotFoundException, PermissionException {
        // Check if list exists and belongs to user
        CustomList list = getListById(listId, userId);
        
        customListDao.delete(list);
    }
    
    @Override
    public CustomList addMovieToList(Long listId, Long userId, Movie movie) 
            throws InstanceNotFoundException, PermissionException, DuplicateInstanceException {
        // Check if list exists and belongs to user
        CustomList list = getListById(listId, userId);
        
        if (movie.getId() == null) {
            movie = movieDao.save(movie);
        }
        
        // Check if movie is already in the list
        if (list.getMovies().contains(movie)) {
            throw new DuplicateInstanceException("Movie", movie.getId());
        }
        
        list.addMovie(movie);
        return customListDao.save(list);
    }
    
    @Override
    public CustomList removeMovieFromList(Long listId, Long userId, Long movieId) 
            throws InstanceNotFoundException, PermissionException {
        // Check if list exists and belongs to user
        CustomList list = getListById(listId, userId);
        
        Optional<Movie> optionalMovie = movieDao.findById(movieId);
        if (!optionalMovie.isPresent()) {
            throw new InstanceNotFoundException("Movie", movieId);
        }
        
        Movie movie = optionalMovie.get();
        if (!list.getMovies().contains(movie)) {
            throw new InstanceNotFoundException("Movie in CustomList", movieId);
        }
        
        list.removeMovie(movie);
        return customListDao.save(list);
    }
}