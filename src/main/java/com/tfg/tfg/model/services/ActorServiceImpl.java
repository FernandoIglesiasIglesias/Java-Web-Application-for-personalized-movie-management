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
    public Actor createOrUpdateActor(Actor actor) {
        if (actor.getId() == null && actor.getTmdbId() != null) {
            Optional<Actor> existingActor = actorDao.findByTmdbId(actor.getTmdbId());
            
            if (existingActor.isPresent()) {
                return updateExistingActor(existingActor.get(), actor);
            }
        }
        
        return actorDao.save(actor);
    }
    
    private Actor updateExistingActor(Actor existing, Actor newData) {
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
    public Actor findByTmdbId(String tmdbId) throws InstanceNotFoundException {
        return actorDao.findByTmdbId(tmdbId)
            .orElseThrow(() -> new InstanceNotFoundException(ENTITY_TYPE, tmdbId));
    }
    

    @Override
    public List<Actor> getAllActors() {
        return actorDao.findAll();
    }

}
