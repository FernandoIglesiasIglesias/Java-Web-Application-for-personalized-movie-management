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
    public Actor createActor(Actor actor) {
        if (actor.getName() == null || actor.getName().isEmpty()) {
            throw new IllegalArgumentException("Actor name cannot be null or empty");
        }
    
        // Primero intentamos encontrar al actor por su imdbId (si existe)
        Optional<Actor> existingActor = Optional.empty();
        if (isValidString(actor.getImdbId())) {
            existingActor = actorDao.findByImdbId(actor.getImdbId());
        }
        
        // Si no lo encontramos por imdbId, buscamos por nombre
        if (!existingActor.isPresent()) {
            existingActor = actorDao.findByName(actor.getName());
        }
        
        // Si ya existe, lo actualizamos con los nuevos datos
        if (existingActor.isPresent()) {
            return updateExistingActor(existingActor.get(), actor);
        }
        
        // Si no existe, creamos uno nuevo
        return actorDao.save(actor);
    }

    @Override
    public Actor updateActor(Actor actor) throws InstanceNotFoundException {
        // Validar que tenemos al menos un criterio de búsqueda
        if (!isValidString(actor.getImdbId()) && !isValidString(actor.getName())) {
            throw new IllegalArgumentException("Actor must have either an IMDB ID or a name");
        }
        
        // Buscar el actor existente
        Actor existingActor = findExistingActor(actor);
        
        // Actualizar y devolver
        return updateExistingActor(existingActor, actor);
    }
    
    /**
     * Encuentra un actor existente por imdbId o nombre
     */
    private Actor findExistingActor(Actor actor) throws InstanceNotFoundException {
        Optional<Actor> optionalActor = Optional.empty();
        String identifier = null;
        
        // Primero buscar por imdbId si está disponible
        if (isValidString(actor.getImdbId())) {
            optionalActor = actorDao.findByImdbId(actor.getImdbId());
            identifier = actor.getImdbId();
        }
        
        // Si no se encuentra por imdbId, buscar por nombre
        if (!optionalActor.isPresent() && isValidString(actor.getName())) {
            optionalActor = actorDao.findByName(actor.getName());
            identifier = actor.getName();
        }
        
        // Si no se encuentra, lanzar excepción
        if (!optionalActor.isPresent()) {
            throw new InstanceNotFoundException(ENTITY_TYPE, identifier != null ? identifier : "unknown");
        }
        
        return optionalActor.get();
    }
    
    /**
     * Actualiza los campos de un actor existente con datos nuevos
     */
    private Actor updateExistingActor(Actor existing, Actor newData) {
        // Actualizar solo campos no nulos
        if (isValidString(newData.getImdbId())) {
            existing.setImdbId(newData.getImdbId());
        }
        
        if (newData.getBirthDate() != null) {
            existing.setBirthDate(newData.getBirthDate());
        }
        
        if (isValidString(newData.getBirthPlace())) {
            existing.setBirthPlace(newData.getBirthPlace());
        }
        
        if (isValidString(newData.getHeight())) {
            existing.setHeight(newData.getHeight());
        }
        
        if (isValidString(newData.getBio())) {
            existing.setBio(newData.getBio());
        }
        
        if (isValidString(newData.getImageUrl())) {
            existing.setImageUrl(newData.getImageUrl());
        }
        
        // Guardar y devolver el actor actualizado
        return actorDao.save(existing);
    }
    
    /**
     * Verifica si una cadena es válida (no nula y no vacía)
     */
    private boolean isValidString(String str) {
        return str != null && !str.isEmpty();
    }
    
    @Override
    public Actor findById(Long id) throws InstanceNotFoundException {
        return actorDao.findById(id)
            .orElseThrow(() -> new InstanceNotFoundException(ENTITY_TYPE, id));
    }
    
    @Override
    public Actor findByName(String name) throws InstanceNotFoundException {
        return actorDao.findByName(name)
            .orElseThrow(() -> new InstanceNotFoundException(ENTITY_TYPE, name));
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