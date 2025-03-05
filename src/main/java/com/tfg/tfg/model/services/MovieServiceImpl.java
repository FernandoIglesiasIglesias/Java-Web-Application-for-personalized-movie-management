package com.tfg.tfg.model.services;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.tfg.tfg.model.entities.Movie;
import com.tfg.tfg.model.entities.MovieDao;
import com.tfg.tfg.model.entities.Actor;
import com.tfg.tfg.model.entities.ActorDao;
import com.tfg.tfg.model.entities.Director;
import com.tfg.tfg.model.entities.DirectorDao;
import com.tfg.tfg.model.entities.Genre;
import com.tfg.tfg.model.entities.GenreDao;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class MovieServiceImpl implements MovieService {
    
    private final MovieDao movieDao;
    private final ActorDao actorDao;
    private final DirectorDao directorDao;
    private final GenreDao genreDao;

    public MovieServiceImpl(MovieDao movieDao, ActorDao actorDao, DirectorDao directorDao, GenreDao genreDao) {
        this.movieDao = movieDao;
        this.actorDao = actorDao;
        this.directorDao = directorDao;
        this.genreDao = genreDao;
    }

    public List<Movie> getAllMovies() {
        return movieDao.findAll();
    }

    public Optional<Movie> getMovieById(Long id) {
        return movieDao.findById(id);
    }

    public Movie saveMovie(Movie movie) {
        // Guardar actores
        for (Actor actor : movie.getActors()) {
            actorDao.save(actor);
        }

        // Guardar directores
        for (Director director : movie.getDirectors()) {
            directorDao.save(director);
        }

        // Guardar géneros
        for (Genre genre : movie.getGenres()) {
            genreDao.save(genre);
        }

        // Guardar la película
        return movieDao.save(movie);
    }
}