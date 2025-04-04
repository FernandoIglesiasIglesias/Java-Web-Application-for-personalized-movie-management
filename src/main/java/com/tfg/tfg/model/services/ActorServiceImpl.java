package com.tfg.tfg.model.services;

import java.util.List;
import java.util.Optional;

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
        if (actor.getName() == null) {
            throw new IllegalArgumentException("Actor name cannot be null");
        }
        
        Optional<Actor> optionalActor = actorDao.findByName(actor.getName());

        if (!optionalActor.isPresent()) {
            throw new InstanceNotFoundException(ENTITY_TYPE, actor.getName());
        }   
        
        Actor existingActor = optionalActor.get();
        
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
    public Actor findByName(String name) throws InstanceNotFoundException {
        Optional<Actor> optActor = actorDao.findByName(name);
        if (optActor.isPresent()) {
            return optActor.get();
        }
        throw new InstanceNotFoundException(ENTITY_TYPE, name);
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