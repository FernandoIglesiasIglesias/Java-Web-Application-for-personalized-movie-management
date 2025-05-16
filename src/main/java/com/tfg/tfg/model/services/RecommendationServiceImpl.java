package com.tfg.tfg.model.services;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;

import java.util.Optional;
import org.springframework.stereotype.Service;

import com.tfg.tfg.model.entities.Actor;
import com.tfg.tfg.model.entities.CustomList;
import com.tfg.tfg.model.entities.CustomListDao;
import com.tfg.tfg.model.entities.Director;
import com.tfg.tfg.model.entities.Genre;
import com.tfg.tfg.model.entities.Movie;
import com.tfg.tfg.model.entities.MovieDao;
import com.tfg.tfg.model.entities.UserActivity;
import com.tfg.tfg.model.entities.UserActivityDao;
import com.tfg.tfg.model.entities.UserProfile;
import com.tfg.tfg.model.entities.UserProfileDao;

import java.util.Objects;
import java.util.Set;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class RecommendationServiceImpl implements RecommendationService {

    private final UserActivityDao userActivityDao;
    private final UserProfileDao userProfileDao;
    private final MovieDao movieDao;
    private final CustomListDao customListDao;

    public RecommendationServiceImpl(UserActivityDao userActivityDao, UserProfileDao userProfileDao, MovieDao movieDao, CustomListDao customListDao) {
        this.userActivityDao = userActivityDao;
        this.userProfileDao = userProfileDao;
        this.movieDao = movieDao;
        this.customListDao = customListDao;
    }

    @Override
    public void recordUserActivity(Long userId, Long movieId, String activityType, Double rating, String searchParams) {
        UserActivity activity = new UserActivity();
        activity.setUserId(userId);
        activity.setMovieId(movieId);
        activity.setActivityType(activityType);
        activity.setRating(rating);
        activity.setSearchParams(searchParams);
        activity.setTimestamp(LocalDateTime.now());
        userActivityDao.save(activity);
        
        updateUserProfile(userId);
    }

    private void updateUserProfile(Long userId) {
        UserProfile profile = userProfileDao.findByUserId(userId);
        if (profile == null) {
            profile = new UserProfile();
            profile.setUserId(userId);
        }
        
        // Obtener actividades del usuario
        List<UserActivity> activities = userActivityDao.findByUserIdOrderByTimestampDesc(userId);
        
        // Actualizar preferencias basadas en vistas
        Map<String, Double> genrePreferences = new HashMap<>();
        Map<String, Double> actorPreferences = new HashMap<>();
        Map<String, Double> directorPreferences = new HashMap<>();
        
        for (UserActivity activity : activities) {
            if (activity.getMovieId() != null) {
                Movie movie = movieDao.findById(activity.getMovieId()).orElse(null);
                if (movie != null) {
                    double weight = calculateWeight(activity);
                    // Actualizar preferencias de géneros
                    for (Genre genre : movie.getGenres()) {
                        String genreName = genre.getName();
                        genrePreferences.put(genreName, 
                            genrePreferences.getOrDefault(genreName, 0.0) + weight);
                    }
                    
                    // Actualizar preferencias de actores
                    for (Actor actor : movie.getActors()) {
                        String actorName = actor.getName();
                        actorPreferences.put(actorName, 
                            actorPreferences.getOrDefault(actorName, 0.0) + weight);
                    }
                    
                    // Actualizar preferencias de directores
                    for (Director director : movie.getDirectors()) {
                        String directorName = director.getName();
                        directorPreferences.put(directorName, 
                            directorPreferences.getOrDefault(directorName, 0.0) + weight);
                    }
                }
            }
        }
        
        profile.setGenrePreferences(genrePreferences);
        profile.setActorPreferences(actorPreferences);
        profile.setDirectorPreferences(directorPreferences);
        profile.setLastUpdated(LocalDateTime.now());
        
        userProfileDao.save(profile);
    }

    private double calculateWeight(UserActivity activity) {
        double baseWeight = 1.0;
        
        // Las valoraciones tienen más peso
        if ("RATE".equals(activity.getActivityType()) && activity.getRating() != null) {
            baseWeight = activity.getRating() / 5.0 * 3.0; // Escala de 0 a 3 según la valoración
        }
        
        // Las actividades más recientes tienen más peso
        long daysAgo = LocalDateTime.now().toLocalDate().toEpochDay() - 
                      activity.getTimestamp().toLocalDate().toEpochDay();
        double recencyFactor = Math.max(0.5, 1.0 - (daysAgo / 30.0)); // Disminuye con el tiempo
        
        return baseWeight * recencyFactor;
    }

@Override
public List<Movie> getRecommendations(Long userId, int limit) {
    UserProfile profile = userProfileDao.findByUserId(userId);
    if (profile == null) {
        return new ArrayList<>();
    }
    
    // Obtener todas las películas y calcular una puntuación de coincidencia
    List<Movie> allMovies = movieDao.findAll();
    
    // Calcular score para cada película basado en el perfil del usuario
    Map<Movie, Double> movieScores = new HashMap<>();
    
    for (Movie movie : allMovies) {
        double score = 0.0;
        
        // Puntuación basada en géneros
        for (Genre genre : movie.getGenres()) {
            String genreName = genre.getName();
            score += profile.getGenrePreferences().getOrDefault(genreName, 0.0) * 1.5; // Peso mayor para géneros
        }
        
        // Puntuación basada en actores
        for (Actor actor : movie.getActors()) {
            String actorName = actor.getName();
            score += profile.getActorPreferences().getOrDefault(actorName, 0.0);
        }
        
        // Puntuación basada en director
        for (Director director : movie.getDirectors()) {
            String directorName = director.getName();
            score += profile.getDirectorPreferences().getOrDefault(directorName, 0.0) * 1.2;
        }
        
        movieScores.put(movie, score);
    }
    
    // Recopilación de películas a excluir de las recomendaciones
    Set<Long> excludedMovieIds = new HashSet<>();
    
    // 1. Excluir películas valoradas por el usuario
    List<Long> ratedMovieIds = userActivityDao.findByUserIdAndActivityType(userId, "RATE").stream()
        .map(UserActivity::getMovieId)
        .filter(Objects::nonNull)
        .toList();
    excludedMovieIds.addAll(ratedMovieIds);
    
    // 2. Excluir películas en la lista personalizada "Películas vistas" si existe
    try {
        // Intentamos buscar la lista "Películas vistas" del usuario
        // Nota: Necesitamos inyectar CustomListDao y CustomListService
        List<CustomList> userLists = customListDao.findByUserId(userId);
        Optional<CustomList> watchedListOpt = userLists.stream()
            .filter(list -> "Películas vistas".equalsIgnoreCase(list.getName()))
            .findFirst();
        
        if (watchedListOpt.isPresent()) {
            // Si existe la lista, añadimos todos sus IDs a excluir
            CustomList watchedList = watchedListOpt.get();
            List<Long> watchedMovieIds = watchedList.getMovies().stream()
                .map(Movie::getId)
                .toList();
            excludedMovieIds.addAll(watchedMovieIds);
        }
    } catch (Exception e) {
        // Si hay algún error, simplemente continuamos sin excluir estas películas
    }
    
    // Ordenar por puntuación y devolver las mejores N recomendaciones excluyendo las que están en excludedMovieIds
    return movieScores.entrySet().stream()
        .filter(entry -> !excludedMovieIds.contains(entry.getKey().getId()))
        .sorted(Map.Entry.comparingByValue(Comparator.reverseOrder()))
        .limit(limit)
        .map(Map.Entry::getKey)
        .toList();
}
    
}
