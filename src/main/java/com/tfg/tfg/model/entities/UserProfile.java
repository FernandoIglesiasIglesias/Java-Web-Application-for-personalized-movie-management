package com.tfg.tfg.model.entities;

import java.util.HashMap;
import java.util.Map;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "UserProfiles")
public class UserProfile {
    
    @Id
    private Long userId;
    
    @ElementCollection
    private Map<String, Double> genrePreferences = new HashMap<>();
    
    @ElementCollection
    private Map<String, Double> actorPreferences = new HashMap<>();
    
    @ElementCollection
    private Map<String, Double> directorPreferences = new HashMap<>();
    
    private LocalDateTime lastUpdated;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Map<String, Double> getGenrePreferences() {
        return genrePreferences;
    }

    public void setGenrePreferences(Map<String, Double> genrePreferences) {
        this.genrePreferences = genrePreferences;
    }

    public Map<String, Double> getActorPreferences() {
        return actorPreferences;
    }

    public void setActorPreferences(Map<String, Double> actorPreferences) {
        this.actorPreferences = actorPreferences;
    }

    public Map<String, Double> getDirectorPreferences() {
        return directorPreferences;
    }

    public void setDirectorPreferences(Map<String, Double> directorPreferences) {
        this.directorPreferences = directorPreferences;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}