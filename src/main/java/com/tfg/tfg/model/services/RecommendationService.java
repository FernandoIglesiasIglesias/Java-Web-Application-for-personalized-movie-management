package com.tfg.tfg.model.services;

import java.util.List;

import com.tfg.tfg.model.entities.Movie;

public interface RecommendationService {
    
    public void recordUserActivity(Long userId, Long movieId, String activityType, Double rating, String searchParams);

    public List<Movie> getRecommendations(Long userId, int limit);

}
