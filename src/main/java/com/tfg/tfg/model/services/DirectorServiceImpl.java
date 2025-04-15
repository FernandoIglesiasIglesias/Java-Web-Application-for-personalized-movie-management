package com.tfg.tfg.model.services;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

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
    public Director createDirector(Director director) {
        if (director.getName() == null || director.getName().isEmpty()) {
            throw new IllegalArgumentException("Director name cannot be null or empty");
        }
    
        // Primero intentamos encontrar al director por su imdbId (si existe)
        Optional<Director> existingDirector = Optional.empty();
        if (isValidString(director.getImdbId())) {
            existingDirector = directorDao.findByImdbId(director.getImdbId());
        }
        
        // Si no lo encontramos por imdbId, buscamos por nombre
        if (!existingDirector.isPresent()) {
            existingDirector = directorDao.findByName(director.getName());
        }
        
        // Si ya existe, lo actualizamos con los nuevos datos
        if (existingDirector.isPresent()) {
            return updateExistingDirector(existingDirector.get(), director);
        }
        
        // Si no existe, creamos uno nuevo
        return directorDao.save(director);
    }

    @Override
    public Director updateDirector(Director director) throws InstanceNotFoundException {
        // Validar que tenemos al menos un criterio de búsqueda
        if (!isValidString(director.getImdbId()) && !isValidString(director.getName())) {
            throw new IllegalArgumentException("Director must have either an IMDB ID or a name");
        }
        
        // Buscar el director existente
        Director existingDirector = findExistingDirector(director);
        
        // Actualizar y devolver
        return updateExistingDirector(existingDirector, director);
    }
    
    /**
     * Encuentra un director existente por imdbId o nombre
     */
    private Director findExistingDirector(Director director) throws InstanceNotFoundException {
        Optional<Director> optionalDirector = Optional.empty();
        String identifier = null;
        
        // Primero buscar por imdbId si está disponible
        if (isValidString(director.getImdbId())) {
            optionalDirector = directorDao.findByImdbId(director.getImdbId());
            identifier = director.getImdbId();
        }
        
        // Si no se encuentra por imdbId, buscar por nombre
        if (!optionalDirector.isPresent() && isValidString(director.getName())) {
            optionalDirector = directorDao.findByName(director.getName());
            identifier = director.getName();
        }
        
        // Si no se encuentra, lanzar excepción
        if (!optionalDirector.isPresent()) {
            throw new InstanceNotFoundException(ENTITY_TYPE, identifier != null ? identifier : "unknown");
        }
        
        return optionalDirector.get();
    }
    
    /**
     * Actualiza los campos de un director existente con datos nuevos
     */
    private Director updateExistingDirector(Director existing, Director newData) {
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
        
        // Guardar y devolver el director actualizado
        return directorDao.save(existing);
    }
    
    /**
     * Verifica si una cadena es válida (no nula y no vacía)
     */
    private boolean isValidString(String str) {
        return str != null && !str.isEmpty();
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