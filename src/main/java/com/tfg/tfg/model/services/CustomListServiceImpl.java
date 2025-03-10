package com.tfg.tfg.model.services;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.tfg.tfg.model.entities.CustomList;
import com.tfg.tfg.model.entities.CustomListDao;
import com.tfg.tfg.model.entities.Movie;
import com.tfg.tfg.model.entities.MovieDao;
import com.tfg.tfg.model.entities.Users;
import com.tfg.tfg.model.entities.UsersDao;
import com.tfg.tfg.model.services.exceptions.DuplicateListNameException;
import com.tfg.tfg.model.services.exceptions.EmptyUserListsException;
import com.tfg.tfg.model.services.exceptions.InstanceNotFoundException;
import com.tfg.tfg.model.services.exceptions.MovieAlreadyInListException;
import com.tfg.tfg.model.services.exceptions.PermissionException;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class CustomListServiceImpl implements CustomListService {
    
    private static final String CUSTOM_LIST_ENTITY_NAME = "CustomList";

    private final CustomListDao customListDao;
    private final MovieDao movieDao;
    private final UsersDao usersDao;
    
    public CustomListServiceImpl(CustomListDao customListDao, MovieDao movieDao, UsersDao usersDao) {
        this.customListDao = customListDao;
        this.movieDao = movieDao;
        this.usersDao = usersDao;
    }
    
    @Override
    public CustomList createList(String name, Users user) throws DuplicateListNameException {
        if (customListDao.findByNameAndUserId(name, user.getId()).isPresent()) {
            throw new DuplicateListNameException(name, user.getId());
        }
        
        CustomList list = new CustomList(name, user);
        return customListDao.save(list);
    }
    
    @Override
    public List<CustomList> getUserLists(Long userId) throws InstanceNotFoundException, EmptyUserListsException  {
        if (!usersDao.existsById(userId)) {
            throw new InstanceNotFoundException("User", userId);
        }
        
        List<CustomList> lists = customListDao.findByUserId(userId);
        
        if (lists == null || lists.isEmpty()) {
            throw new EmptyUserListsException(userId);
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
            throws InstanceNotFoundException, PermissionException, DuplicateListNameException {
        // Check if list exists and belongs to user
        CustomList list = getListById(listId, userId);
        
        // Check for duplicate names
        if (customListDao.findByNameAndUserIdAndIdNot(newName, userId, listId).isPresent()) {
            throw new DuplicateListNameException(newName, userId);
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
            throws InstanceNotFoundException, PermissionException, MovieAlreadyInListException {
        CustomList list = getListById(listId, userId);
        
        if (movie.getId() == null) {
            movie = movieDao.save(movie);
        }
        
        if (list.getMovies().contains(movie)) {
            throw new MovieAlreadyInListException(
                movie.getId(), 
                listId, 
                movie.getTitle(), 
                list.getName()
            );
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