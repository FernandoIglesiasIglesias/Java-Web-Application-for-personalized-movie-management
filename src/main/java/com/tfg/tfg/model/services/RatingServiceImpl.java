package com.tfg.tfg.model.services;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tfg.tfg.model.entities.Movie;
import com.tfg.tfg.model.entities.MovieDao;
import com.tfg.tfg.model.entities.Rating;
import com.tfg.tfg.model.entities.RatingDao;
import com.tfg.tfg.model.entities.Users;
import com.tfg.tfg.model.entities.UsersDao;
import com.tfg.tfg.model.services.exceptions.InstanceNotFoundException;
import com.tfg.tfg.model.services.exceptions.InvalidRatingException;
import com.tfg.tfg.model.services.exceptions.NoRatingsException;

/**
 * Implementation of the Rating Service interface.
 */
@Service
@Transactional
public class RatingServiceImpl implements RatingService {

    private static final String USER_ENTITY = "project.entities.user";
    private static final String MOVIE_ENTITY = "project.entities.movie";
    private static final String RATING_ENTITY = "project.entities.rating";
    private static final int MIN_RATING = 0;
    private static final int MAX_RATING = 10;

    private final RatingDao ratingDao;
    private final UsersDao usersDao;
    private final MovieDao movieDao;

    /**
     * Constructor for RatingServiceImpl.
     * 
     * @param ratingDao the DAO for Rating entities
     * @param usersDao the DAO for User entities
     * @param movieDao the DAO for Movie entities
     */
    public RatingServiceImpl(RatingDao ratingDao, UsersDao usersDao, MovieDao movieDao) {
        this.ratingDao = ratingDao;
        this.usersDao = usersDao;
        this.movieDao = movieDao;
    }

    @Override
    public Rating rateMovie(Long userId, Long movieId, Float ratingValue) 
            throws InstanceNotFoundException, InvalidRatingException {

        if (ratingValue < MIN_RATING || ratingValue > MAX_RATING) {
            throw new InvalidRatingException("La valoración debe estar entre " + MIN_RATING + " y " + MAX_RATING);
        }

        String valueStr = String.valueOf(ratingValue);
        int decimalPlaces = valueStr.contains(".") ? 
                          valueStr.length() - valueStr.indexOf('.') - 1 : 0;
                          
        if (decimalPlaces > 1) {
            throw new InvalidRatingException("La valoración solo puede tener un decimal");
        }

        Users user = usersDao.findById(userId)
            .orElseThrow(() -> new InstanceNotFoundException(USER_ENTITY, userId));

        Movie movie = movieDao.findById(movieId)
            .orElseThrow(() -> new InstanceNotFoundException(MOVIE_ENTITY, movieId));

        Optional<Rating> existingRating = ratingDao.findByUserAndMovie(user, movie);
        Rating rating;

        if (existingRating.isPresent()) {
            rating = existingRating.get();
            rating.setRating(ratingValue);
        } else {
            rating = new Rating();
            rating.setUser(user);
            rating.setMovie(movie);
            rating.setRating(ratingValue);
        }

        return ratingDao.save(rating);
    }

    @Override
    @Transactional(readOnly = true)
    public Rating getUserRatingForMovie(Long userId, Long movieId) throws InstanceNotFoundException {
        Users user = usersDao.findById(userId)
            .orElseThrow(() -> new InstanceNotFoundException(USER_ENTITY, userId));

        Movie movie = movieDao.findById(movieId)
            .orElseThrow(() -> new InstanceNotFoundException(MOVIE_ENTITY, movieId));

        return ratingDao.findByUserAndMovie(user, movie).orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public float getAverageRatingForMovie(Long movieId) throws InstanceNotFoundException, NoRatingsException {

        Optional<Movie> movieOptional = movieDao.findById(movieId);

        Movie movie = movieOptional.orElseThrow(() -> new InstanceNotFoundException(MOVIE_ENTITY, movieId));
        
        List<Rating> ratings = ratingDao.findByMovie(movie);

        if (ratings.isEmpty()) {
            throw new NoRatingsException("La película no tiene valoraciones");
        }

        return ratingDao.getAverageRatingByMovieId(movieId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Rating> getUserRatings(Long userId) throws InstanceNotFoundException {
        Users user = usersDao.findById(userId)
            .orElseThrow(() -> new InstanceNotFoundException(USER_ENTITY, userId));

        return ratingDao.findByUser(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Rating> getMovieRatings(Long movieId) throws InstanceNotFoundException {
        Movie movie = movieDao.findById(movieId)
            .orElseThrow(() -> new InstanceNotFoundException(MOVIE_ENTITY, movieId));

        return ratingDao.findByMovie(movie);
    }

    @Override
    public void deleteRating(Long userId, Long movieId) throws InstanceNotFoundException {
        Users user = usersDao.findById(userId)
            .orElseThrow(() -> new InstanceNotFoundException(USER_ENTITY, userId));

        Movie movie = movieDao.findById(movieId)
            .orElseThrow(() -> new InstanceNotFoundException(MOVIE_ENTITY, movieId));

        Optional<Rating> rating = ratingDao.findByUserAndMovie(user, movie);

        if (!rating.isPresent()) {
            throw new InstanceNotFoundException(RATING_ENTITY, 
                "userId=" + userId + ", movieId=" + movieId);
        }

        ratingDao.delete(rating.get());
    }
}