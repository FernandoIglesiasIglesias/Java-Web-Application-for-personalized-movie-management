package com.tfg.tfg.model.services;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.tfg.tfg.model.entities.Actor;
import com.tfg.tfg.model.entities.Director;
import com.tfg.tfg.model.entities.DirectorDao;
import com.tfg.tfg.model.services.exceptions.InstanceNotFoundException;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class DirectorServiceImpl implements DirectorService {
    
    private static final String ENTITY_TYPE = "project.entities.director";
    private final DirectorDao directorDao;

    public DirectorServiceImpl(DirectorDao directorDao) {
        this.directorDao = directorDao;
    }

    @Override
    public Director updateDirector(Director director) throws InstanceNotFoundException {
        if (director.getName() == null) {
            throw new IllegalArgumentException("Director name cannot be null");
        }
        
        Optional<Director> optionalDirector = directorDao.findByName(director.getName());

        if (!optionalDirector.isPresent()) {
            throw new InstanceNotFoundException(ENTITY_TYPE, director.getName());
        }   
        
        Director existingDirector = optionalDirector.get();
        
        return updateExistingDirector(existingDirector, director);
    }
    
    private Director updateExistingDirector(Director existing, Director newData) {

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
        
        return directorDao.save(existing);
    }
    
    @Override
    public Director findById(Long id) throws InstanceNotFoundException {
        return directorDao.findById(id)
            .orElseThrow(() -> new InstanceNotFoundException(ENTITY_TYPE, id));
    }
    
    @Override
    public Director findByName(String name) throws InstanceNotFoundException {
        return directorDao.findByName(name)
            .orElseThrow(() -> new InstanceNotFoundException(ENTITY_TYPE, name));
    }
    
    @Override
    public Director findByImdbId(String imdbId) throws InstanceNotFoundException {
        return directorDao.findByImdbId(imdbId)
            .orElseThrow(() -> new InstanceNotFoundException(ENTITY_TYPE, imdbId));
    }
    
    @Override
    public List<Director> getAllDirectors() {
        return directorDao.findAll();
    }
}