package com.tfg.tfg.model.entities;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RatingDao extends JpaRepository<Rating, RatingPK> {
    
    @Query("SELECT AVG(r.rating) FROM Rating r WHERE r.movie.id = :movieId")
    Float getAverageRatingByMovieId(@Param("movieId") Long movieId);
    
    List<Rating> findByUser(Users user);
    
    List<Rating> findByMovie(Movie movie);
    
    Optional<Rating> findByUserAndMovie(Users user, Movie movie);
    
}