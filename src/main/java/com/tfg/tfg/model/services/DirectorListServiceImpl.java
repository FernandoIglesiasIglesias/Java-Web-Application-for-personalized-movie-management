package com.tfg.tfg.model.services;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tfg.tfg.model.entities.Director;
import com.tfg.tfg.model.entities.DirectorDao;
import com.tfg.tfg.model.entities.DirectorList;
import com.tfg.tfg.model.entities.DirectorListDao;
import com.tfg.tfg.model.entities.Users;
import com.tfg.tfg.model.entities.UsersDao;
import com.tfg.tfg.model.services.exceptions.DuplicateListNameException;
import com.tfg.tfg.model.services.exceptions.EmptyUserListsException;
import com.tfg.tfg.model.services.exceptions.InstanceNotFoundException;

@Service
@Transactional
public class DirectorListServiceImpl implements DirectorListService {

    private final DirectorListDao directorListDao;
    private final UsersDao usersDao;
    private final DirectorDao directorDao;
    
    public DirectorListServiceImpl(DirectorListDao directorListDao, UsersDao usersDao, DirectorDao directorDao) {
        this.directorListDao = directorListDao;
        this.usersDao = usersDao;
        this.directorDao = directorDao;
    }
    
    @Override
    public DirectorList createDirectorList(Long userId, String name) 
            throws InstanceNotFoundException, DuplicateListNameException {
        
        Users user = usersDao.findById(userId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.user", userId));
        
        if (directorListDao.existsByUserIdAndName(userId, name)) {
            throw new DuplicateListNameException(name, user.getId());
        }
        
        DirectorList directorList = new DirectorList(user, name);
        return directorListDao.save(directorList);
    }
    
    @Override
    public List<DirectorList> getUserDirectorLists(Long userId) 
            throws EmptyUserListsException, InstanceNotFoundException {
        
        if (!usersDao.existsById(userId)) {
            throw new InstanceNotFoundException("project.entities.user", userId);
        }
        
        List<DirectorList> directorLists = directorListDao.findByUserId(userId);
        
        if (directorLists.isEmpty()) {
            throw new EmptyUserListsException(userId);
        }
        
        return directorLists;
    }
    
    @Override
    public DirectorList getDirectorListById(Long listId) throws InstanceNotFoundException {
        return directorListDao.findById(listId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.directorList", listId));
    }
    
    @Override
    public DirectorList updateDirectorListName(Long listId, String newName) 
            throws InstanceNotFoundException, DuplicateListNameException {
        
        DirectorList directorList = getDirectorListById(listId);
        
        if (directorList.getName().equals(newName)) {
            return directorList;
        }
        
        if (directorListDao.existsByUserIdAndName(directorList.getUser().getId(), newName)) {
            throw new DuplicateListNameException(newName, directorList.getUser().getId());
        }
        
        directorList.setName(newName);
        return directorListDao.save(directorList);
    }
    
    @Override
    public void deleteDirectorList(Long listId) throws InstanceNotFoundException {

        if (!directorListDao.existsById(listId)) {
            throw new InstanceNotFoundException("project.entities.directorList", listId);
        }
        
        directorListDao.deleteById(listId);
    }
    
    @Override
    public DirectorList addDirectorToList(Long listId, Long directorId) throws InstanceNotFoundException {
        DirectorList directorList = getDirectorListById(listId);
        Director director = directorDao.findById(directorId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.director", directorId));
        
        directorList.addDirector(director);
        return directorListDao.save(directorList);
    }
    
    @Override
    public DirectorList removeDirectorFromList(Long listId, Long directorId) throws InstanceNotFoundException {
        DirectorList directorList = getDirectorListById(listId);
        Director director = directorDao.findById(directorId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.director", directorId));
        
        directorList.removeDirector(director);
        return directorListDao.save(directorList);
    }
}