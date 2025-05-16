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

    @Override
    public List<Movie> getAllMovies() {
        return movieDao.findAll();
    }

    @Override
    public Optional<Movie> getMovieById(Long id) {
        return movieDao.findById(id);
    }

    @Override
    public Movie saveMovie(Movie movie) {

        Optional<Movie> optionalMovie = movieDao.findByImdbId(movie.getImdbId());

        if (optionalMovie.isPresent()) {
            return optionalMovie.get();
        }

        // Verificar y asociar actores existentes
        List<Actor> processedActors = movie.getActors().stream().map(actor -> {
            if (actor.getImdbId() != null) {
                Optional<Actor> existingActor = actorDao.findByImdbId(actor.getImdbId());
                return existingActor.orElseGet(() -> actorDao.save(actor));
            } else {
                // Si el imdbId es nulo, buscar por nombre o crear un nuevo actor
                Optional<Actor> existingActor = actorDao.findByName(actor.getName());
                return existingActor.orElseGet(() -> actorDao.save(actor));
            }
        }).toList();
        movie.setActors(processedActors);

        // Verificar y asociar directores existentes
        List<Director> processedDirectors = movie.getDirectors().stream().map(director -> {
            if (director.getImdbId() != null) {
                Optional<Director> existingDirector = directorDao.findByImdbId(director.getImdbId());
                return existingDirector.orElseGet(() -> directorDao.save(director));
            } else {
                // Si el imdbId es nulo, buscar por nombre o crear un nuevo director
                Optional<Director> existingDirector = directorDao.findByName(director.getName());
                return existingDirector.orElseGet(() -> directorDao.save(director));
            }
        }).toList();
        movie.setDirectors(processedDirectors);

        for (Genre genre : movie.getGenres()) {
            genreDao.save(genre);
        }

        return movieDao.save(movie);
    }
}