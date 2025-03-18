package com.tfg.tfg.model.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.tfg.tfg.model.entities.Actor;
import com.tfg.tfg.model.entities.ActorDao;
import com.tfg.tfg.model.services.exceptions.InstanceNotFoundException;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class ActorServiceImpl implements ActorService {
    
    private static final String ENTITY_TYPE = "project.entities.actor";
    private final ActorDao actorDao;

    public ActorServiceImpl(ActorDao actorDao) {
        this.actorDao = actorDao;
    }

    @Override
    public Actor updateActor(Actor actor) throws InstanceNotFoundException {
        if (actor.getFirstName() == null || actor.getFirstName().isEmpty() || 
            actor.getLastName() == null || actor.getLastName().isEmpty()) {
            throw new IllegalArgumentException("First name and last name cannot be null or empty for actor updates");
        }
        
        // Find the actor by first name and last name to ensure it exists
        Actor existingActor = findByFirstNameAndLastName(actor.getFirstName(), actor.getLastName());
        
        // Update the existing actor's fields
        return updateExistingActor(existingActor, actor);
    }
    
    private Actor updateExistingActor(Actor existing, Actor newData) {
        // Si el actor tiene un imdbId, actualizarlo
        if (newData.getImdbId() != null && !newData.getImdbId().isEmpty()) {
            existing.setImdbId(newData.getImdbId());
        }
        
        if (newData.getBirthDate() != null) {
            existing.setBirthDate(newData.getBirthDate());
        }
        
        if (newData.getBirthPlace() != null && !newData.getBirthPlace().isEmpty()) {
            existing.setBirthPlace(newData.getBirthPlace());
        }
        
        if (newData.getStarSign() != null && !newData.getStarSign().isEmpty()) {
            existing.setStarSign(newData.getStarSign());
        }
        
        if (newData.getHeight() != null && !newData.getHeight().isEmpty()) {
            existing.setHeight(newData.getHeight());
        }
        
        if (newData.getBio() != null && !newData.getBio().isEmpty()) {
            existing.setBio(newData.getBio());
        }
        
        if (newData.getImageUrl() != null && !newData.getImageUrl().isEmpty()) {
            existing.setImageUrl(newData.getImageUrl());
        }
        
        return actorDao.save(existing);
    }
    
    @Override
    public Actor findById(Long id) throws InstanceNotFoundException {
        return actorDao.findById(id)
            .orElseThrow(() -> new InstanceNotFoundException(ENTITY_TYPE, id));
    }
    
    @Override
    public Actor findByFirstNameAndLastName(String firstName, String lastName) throws InstanceNotFoundException {
        return actorDao.findByFirstNameAndLastName(firstName, lastName)
            .orElseThrow(() -> new InstanceNotFoundException(ENTITY_TYPE, firstName + " " + lastName));
    }
    
    @Override
    public Actor findByImdbId(String imdbId) throws InstanceNotFoundException {
        return actorDao.findByImdbId(imdbId)
            .orElseThrow(() -> new InstanceNotFoundException(ENTITY_TYPE, imdbId));
    }
    
    @Override
    public List<Actor> getAllActors() {
        return actorDao.findAll();
    }
}