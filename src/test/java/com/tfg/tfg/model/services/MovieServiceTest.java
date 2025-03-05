package com.tfg.tfg.model.services;

import com.tfg.tfg.model.entities.Movie;
import com.tfg.tfg.model.entities.MovieDao;
import com.tfg.tfg.model.entities.Actor;
import com.tfg.tfg.model.entities.ActorDao;
import com.tfg.tfg.model.entities.Director;
import com.tfg.tfg.model.entities.DirectorDao;
import com.tfg.tfg.model.entities.Genre;
import com.tfg.tfg.model.entities.GenreDao;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

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

    @Autowired
    private GenreDao genreDao;

    @BeforeEach
    public void setUp() {
        // Limpiar la base de datos antes de cada prueba
        movieDao.deleteAll();
        actorDao.deleteAll();
        directorDao.deleteAll();
        genreDao.deleteAll();
    }

    private Movie createMovie(String tbdbId, String title, String overview, int releaseYear, String verticalPoster, int duration, List<Genre> genres, List<Actor> actors, List<Director> directors) {
        return new Movie(tbdbId, title, overview, releaseYear, verticalPoster, duration, genres, actors, directors);
    }

    @Test
    public void testGetAllMovies() {
        Genre genre1 = new Genre("Action", List.of());
        Genre genre2 = new Genre("Adventure", List.of());

        Actor actor1 = new Actor("Robert", "Downey Jr.", List.of());
        Director director1 = new Director("Jon", "Favreau", List.of());

        Actor actor2 = new Actor("Chris", "Evans", List.of());
        Director director2 = new Director("Joss", "Whedon", List.of());

        // Guardar géneros, actores y directores antes de guardar la película
        genreDao.save(genre1);
        genreDao.save(genre2);
        actorDao.save(actor1);
        actorDao.save(actor2);
        directorDao.save(director1);
        directorDao.save(director2);

        Movie movie1 = createMovie("tt332", "Iron Man", "A billionaire industrialist and genius inventor, Tony Stark (Robert Downey Jr.), is conducting weapons tests overseas, but terrorists kidnap him to force him to build a devastating weapon.", 2008, "ironman.jpg", 126, List.of(genre1), List.of(actor1), List.of(director1));
        Movie movie2 = createMovie("tt4673", "The Avengers", "Earth's mightiest heroes must come together and learn to fight as a team if they are going to stop the mischievous Loki and his alien army from enslaving humanity.", 2012, "avengers.jpg", 143, List.of(genre2), List.of(actor2), List.of(director2));

        movieService.saveMovie(movie1);
        movieService.saveMovie(movie2);

        List<Movie> result = movieService.getAllMovies();

        assertEquals(2, result.size());
        assertEquals("Iron Man", result.get(0).getTitle());
        assertEquals(126, result.get(0).getRuntime());
        assertEquals("The Avengers", result.get(1).getTitle());
        assertEquals(143, result.get(1).getRuntime());
    }

    @Test
    public void testGetMovieById() {
        Genre genre = new Genre("Action", List.of());
        Actor actor = new Actor("Robert", "Downey Jr.", List.of());
        Director director = new Director("Jon", "Favreau", List.of());

        // Guardar géneros, actores y directores antes de guardar la película
        genreDao.save(genre);
        actorDao.save(actor);
        directorDao.save(director);

        Movie movie = createMovie("tt43722", "Iron Man", "A billionaire industrialist and genius inventor, Tony Stark (Robert Downey Jr.), is conducting weapons tests overseas, but terrorists kidnap him to force him to build a devastating weapon.", 2008, "ironman.jpg", 126, List.of(genre), List.of(actor), List.of(director));

        movieService.saveMovie(movie);

        Optional<Movie> result = movieService.getMovieById(movie.getId());

        assertTrue(result.isPresent());
        assertEquals("Iron Man", result.get().getTitle());
        assertEquals(126, result.get().getRuntime());
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

    @Test
    public void testSaveMovie() {
        Genre genre = new Genre("Action", List.of());
        Actor actor = new Actor("Robert", "Downey Jr.", List.of());
        Director director = new Director("Jon", "Favreau", List.of());

        genreDao.save(genre);
        actorDao.save(actor);
        directorDao.save(director);

        Movie movie = createMovie("tt43722", "Iron Man", "A billionaire industrialist and genius inventor, Tony Stark (Robert Downey Jr.), is conducting weapons tests overseas, but terrorists kidnap him to force him to build a devastating weapon.", 2008, "ironman.jpg", 126, List.of(genre), List.of(actor), List.of(director));

        Movie savedMovie = movieService.saveMovie(movie);

        Optional<Movie> result = movieService.getMovieById(savedMovie.getId());
        assertTrue(result.isPresent());
        assertEquals("Iron Man", result.get().getTitle());
        assertEquals(126, result.get().getRuntime());
    }

    @Test
    public void testSaveExistingMovie() {
        Genre genre = new Genre("Action", List.of());
        Actor actor = new Actor("Robert", "Downey Jr.", List.of());
        Director director = new Director("Jon", "Favreau", List.of());

        genreDao.save(genre);
        actorDao.save(actor);
        directorDao.save(director);

        Movie movie = createMovie("tt43722", "Iron Man", "A billionaire industrialist and genius inventor, Tony Stark (Robert Downey Jr.), is conducting weapons tests overseas, but terrorists kidnap him to force him to build a devastating weapon.", 2008, "ironman.jpg", 126, List.of(genre), List.of(actor), List.of(director));

        movieService.saveMovie(movie);
        Movie savedMovie = movieService.saveMovie(movie);

        List<Movie> allMovies = movieService.getAllMovies();
        assertEquals(1, allMovies.size());
        assertEquals(savedMovie.getId(), allMovies.get(0).getId());
    }

}