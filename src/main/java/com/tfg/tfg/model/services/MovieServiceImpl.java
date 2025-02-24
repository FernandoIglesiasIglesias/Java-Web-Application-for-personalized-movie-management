package com.tfg.tfg.model.services;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.tfg.tfg.model.entities.Movie;
import com.tfg.tfg.model.entities.MovieDao;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class MovieServiceImpl implements MovieService {
    
    private final MovieDao movieDao;

    public MovieServiceImpl(MovieDao movieDao) {
        this.movieDao = movieDao;
    }

    public List<Movie> getAllMovies() {
        return movieDao.findAll();
    }

    public Optional<Movie> getMovieById(Long id) {
        return movieDao.findById(id);
    }
}
