package com.tfg.tfg.model.entities;

import org.springframework.data.domain.Pageable;
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
    
    @Query("SELECT r.movie, AVG(r.rating) as avgRating FROM Rating r " +
    "GROUP BY r.movie ORDER BY avgRating DESC")
    List<Movie> findTopRatedMovies(Pageable pageable);

    @Query("SELECT r.movie, AVG(r.rating) as avgRating FROM Rating r " +
        "JOIN r.movie.genres g WHERE g.name = :genre " +
        "GROUP BY r.movie ORDER BY avgRating DESC")
    List<Movie> findTopRatedMoviesByGenre(@Param("genre") String genre, Pageable pageable);

    @Query("SELECT r.movie, AVG(r.rating) as avgRating FROM Rating r " +
        "WHERE r.movie.releaseYear = :year " +
        "GROUP BY r.movie ORDER BY avgRating DESC")
    List<Movie> findTopRatedMoviesByYear(@Param("year") Integer year, Pageable pageable);

    @Query("SELECT r.movie, AVG(r.rating) as avgRating FROM Rating r " +
        "JOIN r.movie.genres g WHERE g.name = :genre " +
        "AND r.movie.releaseYear = :year " +
        "GROUP BY r.movie ORDER BY avgRating DESC")
    List<Movie> findTopRatedMoviesByGenreAndYear(
        @Param("genre") String genre, 
        @Param("year") Integer year, 
        Pageable pageable);
    
}