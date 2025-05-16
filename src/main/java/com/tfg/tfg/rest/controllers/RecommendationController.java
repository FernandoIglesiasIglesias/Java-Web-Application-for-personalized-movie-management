package com.tfg.tfg.rest.controllers;

import java.util.List;
import java.util.Locale;

import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.tfg.tfg.model.entities.Movie;
import com.tfg.tfg.model.entities.MovieDao;
import com.tfg.tfg.model.services.RecommendationService;
import com.tfg.tfg.model.services.exceptions.InstanceNotFoundException;
import com.tfg.tfg.rest.common.ErrorsDto;
import com.tfg.tfg.rest.dtos.ActivityDto;
import com.tfg.tfg.rest.dtos.MovieConversor;
import com.tfg.tfg.rest.dtos.MovieDto;

@RestController
@RequestMapping("/recommendations")
public class RecommendationController {

    private static final String INSTANCE_NOT_FOUND_EXCEPTION_CODE = "project.exceptions.InstanceNotFoundException";
    
    private final RecommendationService recommendationService;
    private final MessageSource messageSource;
    private final MovieDao movieDao;
    
    public RecommendationController(RecommendationService recommendationService, MessageSource messageSource, MovieDao movieDao) {
        this.recommendationService = recommendationService;
        this.messageSource = messageSource;
        this.movieDao = movieDao;
    }
    
    @ExceptionHandler(InstanceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ResponseBody
    public ErrorsDto handleInstanceNotFoundException(InstanceNotFoundException exception, Locale locale) {
        String errorMessage = messageSource.getMessage(
                INSTANCE_NOT_FOUND_EXCEPTION_CODE, null,
                INSTANCE_NOT_FOUND_EXCEPTION_CODE, locale);
        
        return new ErrorsDto(errorMessage);
    }
    
    /**
     * Obtiene recomendaciones personalizadas para el usuario actual
     * 
     * @param userId ID del usuario autenticado
     * @param limit Número máximo de recomendaciones a devolver
     * @return Lista de películas recomendadas
     */
    @GetMapping
    public List<MovieDto> getRecommendations(
            @RequestAttribute Long userId,
            @RequestParam(defaultValue = "10") int limit) {
        
        List<Movie> recommendations = recommendationService.getRecommendations(userId, limit);
        return MovieConversor.toMovieDtos(recommendations);
    }
    
    /**
     * Registra que un usuario ha visto una película
     * 
     * @param userId ID del usuario autenticado
     * @param imdbId IMDb ID de la película vista
     * @throws InstanceNotFoundException si no se encuentra la película
     */
    @PostMapping("/view/{imdbId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void recordMovieView(@RequestAttribute Long userId, @PathVariable String imdbId) throws InstanceNotFoundException {
        // Buscar el ID interno de la película usando el imdbId
        Movie movie = movieDao.findByImdbId(imdbId)
            .orElseThrow(() -> new InstanceNotFoundException("Movie", imdbId));
            
        recommendationService.recordUserActivity(userId, movie.getId(), "VIEW", null, null);
    }
    
    /**
     * Registra la valoración de una película por parte de un usuario
     * 
     * @param userId ID del usuario autenticado
     * @param imdbId IMDb ID de la película valorada
     * @param activityDto Objeto que contiene los detalles de la valoración
     * @return 400 Bad Request si la valoración es inválida
     * @throws InstanceNotFoundException si no se encuentra la película
     */
    @PostMapping("/rate/{imdbId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<?> rateMovie(
            @RequestAttribute Long userId, 
            @PathVariable String imdbId,
            @RequestBody ActivityDto activityDto) throws InstanceNotFoundException {
        
        Double rating = activityDto.getRating();
        if (rating == null || rating < 0 || rating > 10) {
            return ResponseEntity.badRequest().body(new ErrorsDto("La valoración debe estar entre 0 y 10"));
        }
        
        // Buscar el ID interno de la película usando el imdbId
        Movie movie = movieDao.findByImdbId(imdbId)
            .orElseThrow(() -> new InstanceNotFoundException("Movie", imdbId));
        
        recommendationService.recordUserActivity(userId, movie.getId(), "RATE", rating, null);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Registra una búsqueda realizada por el usuario
     * 
     * @param userId ID del usuario autenticado
     * @param activityDto Objeto que contiene los parámetros de búsqueda
     */
    @PostMapping("/search")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void recordSearch(@RequestAttribute Long userId, @RequestBody ActivityDto activityDto) {
        String searchParams = activityDto.getSearchParams();
        recommendationService.recordUserActivity(userId, null, "SEARCH", null, searchParams);
    }
}