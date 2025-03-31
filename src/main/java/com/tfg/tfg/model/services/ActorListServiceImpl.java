package com.tfg.tfg.model.services;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tfg.tfg.model.entities.Actor;
import com.tfg.tfg.model.entities.ActorDao;
import com.tfg.tfg.model.entities.ActorList;
import com.tfg.tfg.model.entities.ActorListDao;
import com.tfg.tfg.model.entities.Users;
import com.tfg.tfg.model.entities.UsersDao;
import com.tfg.tfg.model.services.exceptions.DuplicateListNameException;
import com.tfg.tfg.model.services.exceptions.EmptyUserListsException;
import com.tfg.tfg.model.services.exceptions.InstanceNotFoundException;

@Service
@Transactional
public class ActorListServiceImpl implements ActorListService {

    private final ActorListDao actorListDao;
    private final UsersDao usersDao;
    private final ActorDao actorDao;
    
    public ActorListServiceImpl(ActorListDao actorListDao, UsersDao usersDao, ActorDao actorDao) {
        this.actorListDao = actorListDao;
        this.usersDao = usersDao;
        this.actorDao = actorDao;
    }
    
    @Override
    public ActorList createActorList(Long userId, String name) 
            throws InstanceNotFoundException, DuplicateListNameException {
        
        Users user = usersDao.findById(userId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.user", userId));
        
        if (actorListDao.existsByUserIdAndName(userId, name)) {
            throw new DuplicateListNameException(name, user.getId());
        }
        
        ActorList actorList = new ActorList(user, name);
        return actorListDao.save(actorList);
    }
    
    @Override
    public List<ActorList> getUserActorLists(Long userId) 
            throws EmptyUserListsException, InstanceNotFoundException {
        
        if (!usersDao.existsById(userId)) {
            throw new InstanceNotFoundException("project.entities.user", userId);
        }
        
        List<ActorList> actorLists = actorListDao.findByUserId(userId);
        
        if (actorLists.isEmpty()) {
            throw new EmptyUserListsException(userId);
        }
        
        return actorLists;
    }
    
    @Override
    public ActorList getActorListById(Long listId) throws InstanceNotFoundException {
        return actorListDao.findById(listId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.actorList", listId));
    }
    
    @Override
    public ActorList updateActorListName(Long listId, String newName) 
            throws InstanceNotFoundException, DuplicateListNameException {
        
        ActorList actorList = getActorListById(listId);
        
        if (actorList.getName().equals(newName)) {
            return actorList;
        }
        
        if (actorListDao.existsByUserIdAndName(actorList.getUser().getId(), newName)) {
            throw new DuplicateListNameException(newName, actorList.getUser().getId());
        }
        
        actorList.setName(newName);
        return actorListDao.save(actorList);
    }
    
    @Override
    public void deleteActorList(Long listId) throws InstanceNotFoundException {

        if (!actorListDao.existsById(listId)) {
            throw new InstanceNotFoundException("project.entities.actorList", listId);
        }
        
        actorListDao.deleteById(listId);
    }
    
    @Override
    public ActorList addActorToList(Long listId, Long actorId) throws InstanceNotFoundException {
        ActorList actorList = getActorListById(listId);
        Actor actor = actorDao.findById(actorId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.actor", actorId));
        
        actorList.addActor(actor);
        return actorListDao.save(actorList);
    }
    
    @Override
    public ActorList removeActorFromList(Long listId, Long actorId) throws InstanceNotFoundException {
        ActorList actorList = getActorListById(listId);
        Actor actor = actorDao.findById(actorId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.actor", actorId));
        
        actorList.removeActor(actor);
        return actorListDao.save(actorList);
    }
    
}