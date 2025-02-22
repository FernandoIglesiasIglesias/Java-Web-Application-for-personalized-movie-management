package com.tfg.tfg.model.services;

import com.tfg.tfg.model.entities.Movie;
import com.tfg.tfg.model.entities.MovieDao;
import com.tfg.tfg.model.entities.Actor;
import com.tfg.tfg.model.entities.ActorDao;
import com.tfg.tfg.model.entities.Director;
import com.tfg.tfg.model.entities.DirectorDao;
import com.tfg.tfg.model.entities.Genre;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
public class MovieServiceTest {

    @Autowired
    private MovieService movieService;

    @Autowired
    private MovieDao movieDao;

    @Autowired
    private ActorDao actorDao;

    @Autowired
    private DirectorDao directorDao;

    @BeforeEach
    public void setUp() {
        // Limpiar la base de datos antes de cada prueba
        movieDao.deleteAll();
        actorDao.deleteAll();
        directorDao.deleteAll();
    }

    private Movie createMovie(String title, List<Actor> actors, List<Director> directors) {
        Movie movie = new Movie(title, "ejemplo synopsis", 120, Genre.ACTION);
        movie.setActors(actors);
        movie.setDirectors(directors);
        return movie;
    }

    @Test
    public void testGetAllMovies() {
        Actor actor1 = new Actor("Robert", "Downey Jr.", "American", LocalDate.of(1965, 4, 4));
        Director director1 = new Director("Jon", "Favreau", "American", LocalDate.of(1966, 10, 19));

        Actor actor2 = new Actor("Chris", "Evans", "American", LocalDate.of(1981, 6, 13));
        Director director2 = new Director("Joss", "Whedon", "American", LocalDate.of(1964, 6, 23));

        // Guardar actores y directores antes de guardar la película
        actorDao.save(actor1);
        actorDao.save(actor2);
        directorDao.save(director1);
        directorDao.save(director2);

        Movie movie1 = createMovie("Iron Man", List.of(actor1), List.of(director1));
        Movie movie2 = createMovie("The Avengers", List.of(actor2), List.of(director2));

        movieDao.save(movie1);
        movieDao.save(movie2);

        List<Movie> result = movieService.getAllMovies();

        assertEquals(2, result.size());
        assertEquals("Iron Man", result.get(0).getTitle());
        assertEquals("The Avengers", result.get(1).getTitle());
    }

    @Test
    public void testGetMovieById() {
        Actor actor = new Actor("Robert", "Downey Jr.", "American", LocalDate.of(1965, 4, 4));
        Director director = new Director("Jon", "Favreau", "American", LocalDate.of(1966, 10, 19));

        // Guardar actores y directores antes de guardar la película
        actorDao.save(actor);
        directorDao.save(director);

        Movie movie = createMovie("Iron Man", List.of(actor), List.of(director));

        movieDao.save(movie);

        Optional<Movie> result = movieService.getMovieById(movie.getId());

        assertTrue(result.isPresent());
        assertEquals("Iron Man", result.get().getTitle());
    }

    @Test
    public void testGetMovieByNonExistentId() {
        Optional<Movie> result = movieService.getMovieById(-1L);
        assertFalse(result.isPresent());
    }

    @Test
    public void testGetAllMoviesWhenNoneExist() {
        List<Movie> result = movieService.getAllMovies();
        assertTrue(result.isEmpty());
    }

}