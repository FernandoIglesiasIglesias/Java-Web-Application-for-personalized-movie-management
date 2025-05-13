package com.tfg.tfg.rest.controllers;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.tfg.tfg.model.entities.MovieReview;
import com.tfg.tfg.model.entities.ReviewVoteDao;
import com.tfg.tfg.model.services.MovieReviewService;
import com.tfg.tfg.model.services.exceptions.InstanceNotFoundException;
import com.tfg.tfg.model.services.exceptions.PermissionException;
import com.tfg.tfg.rest.dtos.MovieReviewConversor;
import com.tfg.tfg.rest.dtos.MovieReviewDto;
import com.tfg.tfg.rest.dtos.ReviewVoteDto;

@RestController
@RequestMapping("/reviews")
public class MovieReviewController {

    private final MovieReviewService movieReviewService;
    private final ReviewVoteDao reviewVoteDao;
        
    public MovieReviewController(MovieReviewService movieReviewService, ReviewVoteDao reviewVoteDao) {
        this.movieReviewService = movieReviewService;
        this.reviewVoteDao = reviewVoteDao;
    }
    
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MovieReviewDto createReview(@RequestAttribute Long userId, 
                                      @RequestBody MovieReviewDto reviewDto) 
            throws InstanceNotFoundException {
        
        MovieReview review = movieReviewService.createReview(
            userId, 
            reviewDto.getMovieImdbId(), 
            reviewDto.getTitle(), 
            reviewDto.getContent()
        );
        
        return MovieReviewConversor.toMovieReviewDtoWithVotes(review, userId, movieReviewService, reviewVoteDao);
    }
    
    @PutMapping("/{id}")
    public MovieReviewDto updateReview(@RequestAttribute Long userId,
                                      @PathVariable Long id,
                                      @RequestBody MovieReviewDto reviewDto) 
            throws InstanceNotFoundException, PermissionException {
        
        MovieReview review = movieReviewService.updateReview(
            userId, 
            id, 
            reviewDto.getTitle(), 
            reviewDto.getContent()
        );
        
        return MovieReviewConversor.toMovieReviewDtoWithVotes(review, userId, movieReviewService, reviewVoteDao);
    }
    
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteReview(@RequestAttribute Long userId,
                            @PathVariable Long id) 
            throws InstanceNotFoundException, PermissionException {
        
        movieReviewService.deleteReview(userId, id);
    }
    
    @GetMapping("/movie/{imdbId}")
    public Map<String, Object> getMovieReviews(
                                    @RequestParam(required = false) Long userId, 
                                    @PathVariable String imdbId,
                                    @RequestParam(defaultValue = "0") int page,
                                    @RequestParam(defaultValue = "10") int size,
                                    @RequestParam(defaultValue = "date") String sort) 
            throws InstanceNotFoundException {
        
        // Convertir criterio de ordenación a Pageable
        Sort sortCriteria;
        switch (sort) {
            case "likes":
            case "dislikes":
                // Para likes y dislikes, solo ordenamos por createdAt y después haremos ordenación en memoria
                sortCriteria = Sort.by("createdAt").descending();
                break;
            case "date":
            default:
                // Ordenar por fecha de creación (más recientes primero)
                sortCriteria = Sort.by("createdAt").descending();
        }
        
        // Crear objeto Pageable con la página, tamaño y ordenación
        Pageable pageable = PageRequest.of(page, size, sortCriteria);
        
        // Obtener página de reseñas
        Page<MovieReview> reviewPage = movieReviewService.getMovieReviewsPaged(imdbId, pageable);
        
        // Convertir reseñas a DTOs con información de votos
        List<MovieReviewDto> reviewDtos = MovieReviewConversor.toMovieReviewDtosWithVotes(
            reviewPage.getContent(),
            userId,
            movieReviewService,
            reviewVoteDao
        );
        
        // Crear una nueva lista mutable para poder ordenarla
        List<MovieReviewDto> sortedReviewDtos = new ArrayList<>(reviewDtos);
        
        // Ordenar según el criterio seleccionado
        if ("likes".equals(sort)) {
            sortedReviewDtos.sort((dto1, dto2) -> {
                Long votes1 = dto1.getHelpfulVotes() != null ? dto1.getHelpfulVotes() : 0L;
                Long votes2 = dto2.getHelpfulVotes() != null ? dto2.getHelpfulVotes() : 0L;
                return votes2.compareTo(votes1); // Orden descendente
            });
        } else if ("dislikes".equals(sort)) {
            sortedReviewDtos.sort((dto1, dto2) -> {
                Long votes1 = dto1.getUnhelpfulVotes() != null ? dto1.getUnhelpfulVotes() : 0L;
                Long votes2 = dto2.getUnhelpfulVotes() != null ? dto2.getUnhelpfulVotes() : 0L;
                return votes2.compareTo(votes1); // Orden descendente
            });
        }
        
        // Crear mapa con reseñas y metadatos de paginación
        Map<String, Object> response = new HashMap<>();
        response.put("reviews", sortedReviewDtos);
        response.put("currentPage", reviewPage.getNumber());
        response.put("totalItems", reviewPage.getTotalElements());
        response.put("totalPages", reviewPage.getTotalPages());
        
        return response;
    }
    
    @GetMapping("/user/{userId}")
    public List<MovieReviewDto> getUserReviews(@PathVariable Long userId) 
            throws InstanceNotFoundException {
        
        return MovieReviewConversor.toMovieReviewDtosWithVotes(
            movieReviewService.getUserReviews(userId),
            userId,
            movieReviewService,
            reviewVoteDao
        );
    }
    
    @PostMapping("/{id}/vote")
    public MovieReviewDto voteReview(@RequestAttribute Long userId,
                                    @PathVariable Long id,
                                    @RequestBody ReviewVoteDto voteDto) 
            throws InstanceNotFoundException, PermissionException {
        
        MovieReview review = movieReviewService.voteReview(userId, id, voteDto.isHelpful());
        
        return MovieReviewConversor.toMovieReviewDtoWithVotes(review, userId, movieReviewService, reviewVoteDao);
    }
    
    @DeleteMapping("/{id}/vote")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeVote(@RequestAttribute Long userId,
                          @PathVariable Long id) 
            throws InstanceNotFoundException, PermissionException {
        
        movieReviewService.removeVote(userId, id);
    }
}