package com.tfg.tfg.model.services;

import static org.junit.jupiter.api.Assertions.*;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.tfg.tfg.model.entities.Genre;
import com.tfg.tfg.model.entities.GenreDao;
import com.tfg.tfg.model.entities.Movie;
import com.tfg.tfg.model.entities.MovieDao;
import com.tfg.tfg.model.entities.Rating;
import com.tfg.tfg.model.entities.RatingDao;
import com.tfg.tfg.model.entities.Users;
import com.tfg.tfg.model.entities.UsersDao;
import com.tfg.tfg.model.services.exceptions.InstanceNotFoundException;
import com.tfg.tfg.model.services.exceptions.InvalidRatingException;
import com.tfg.tfg.model.services.exceptions.NoRatingsException;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
class RatingServiceTest {

    private final Long nonExistentId = -1L;
    private final String nonExistentImdbId = "tt0000000";
    
    @Autowired
    private RatingService ratingService;
    
    @Autowired
    private UsersDao usersDao;
    
    @Autowired
    private MovieDao movieDao;
    
    @Autowired
    private RatingDao ratingDao;
    
    @Autowired
    private GenreDao genreDao;
    
    private Users testUser;
    private Movie testMovie;
    private Movie testMovie2;
    
    @BeforeEach
    void setUp() {
        // Limpiar datos de pruebas anteriores
        ratingDao.deleteAll();
        movieDao.deleteAll();
        usersDao.deleteAll();
        
        // Crear usuario de prueba
        testUser = new Users();
        testUser.setUserName("testUser");
        testUser.setPassword("password");
        testUser.setEmail("test@example.com");
        testUser.setAvatar("/images/default-avatar.webp");
        testUser.setRole(Users.RoleType.USER);
        testUser = usersDao.save(testUser);
        
        // Crear película de prueba 1
        testMovie = new Movie();
        testMovie.setImdbId("tt1234567");
        testMovie.setTitle("Test Movie");
        testMovie.setOverview("This is a test movie");
        testMovie.setReleaseYear(2023);
        testMovie.setVerticalPoster("https://example.com/poster.jpg");
        testMovie.setRuntime(120);
        testMovie = movieDao.save(testMovie);
        
        // Crear película de prueba 2 (para pruebas que requieren múltiples películas)
        testMovie2 = new Movie();
        testMovie2.setImdbId("tt7654321");
        testMovie2.setTitle("Another Test Movie");
        testMovie2.setOverview("This is another test movie");
        testMovie2.setReleaseYear(2022);
        testMovie2.setVerticalPoster("https://example.com/another-poster.jpg");
        testMovie2.setRuntime(110);
        testMovie2 = movieDao.save(testMovie2);
    }
    
    @Test
    void testRateMovie() throws InstanceNotFoundException, InvalidRatingException {
        // Crear una valoración usando imdbId
        Rating rating = ratingService.rateMovie(testUser.getId(), testMovie.getImdbId(), 8.0f);
        
        // Verificar que la valoración se creó correctamente
        assertNotNull(rating);
        assertEquals(8.0f, rating.getRating());
        assertEquals(testUser.getId(), rating.getUser().getId());
        assertEquals(testMovie.getId(), rating.getMovie().getId());
        
        // Verificar que está en la base de datos
        Optional<Rating> savedRating = ratingDao.findByUserAndMovie(testUser, testMovie);
        assertTrue(savedRating.isPresent());
        assertEquals(8, savedRating.get().getRating());
    }
    
    @Test
    void testUpdateRating() throws InstanceNotFoundException, InvalidRatingException {
        // Crear una valoración inicial usando imdbId
        Rating initialRating = ratingService.rateMovie(testUser.getId(), testMovie.getImdbId(), 7.0f);
        assertEquals(7, initialRating.getRating());
        
        // Actualizar la valoración usando imdbId
        Rating updatedRating = ratingService.rateMovie(testUser.getId(), testMovie.getImdbId(), 9.0f);
        
        // Verificar actualización
        assertEquals(9, updatedRating.getRating());
        assertEquals(testUser.getId(), updatedRating.getUser().getId());
        assertEquals(testMovie.getId(), updatedRating.getMovie().getId());
        
        // Verificar que se actualizó en la base de datos
        Optional<Rating> savedRating = ratingDao.findByUserAndMovie(testUser, testMovie);
        assertTrue(savedRating.isPresent());
        assertEquals(9, savedRating.get().getRating());
    }
    
    @Test
    void testRateMovieWithInvalidRatingTooLow() {
        // Verificar que se lanza excepción con valor debajo del mínimo usando imdbId
        assertThrows(InvalidRatingException.class, () -> {
            ratingService.rateMovie(testUser.getId(), testMovie.getImdbId(), -1.0f);
        });
    }
    
    @Test
    void testRateMovieWithInvalidRatingTooHigh() {
        // Verificar que se lanza excepción con valor por encima del máximo usando imdbId
        assertThrows(InvalidRatingException.class, () -> {
            ratingService.rateMovie(testUser.getId(), testMovie.getImdbId(), 11.0f);
        });
    }
    
    @Test
    void testRateMovieWithNonExistingUser() {
        // Verificar que se lanza excepción con un usuario que no existe usando imdbId
        assertThrows(InstanceNotFoundException.class, () -> {
            ratingService.rateMovie(nonExistentId, testMovie.getImdbId(), 8.0f);
        });
    }
    
    @Test
    void testRateMovieWithNonExistingMovie() {
        // Verificar que se lanza excepción con una película que no existe usando imdbId
        assertThrows(InstanceNotFoundException.class, () -> {
            ratingService.rateMovie(testUser.getId(), nonExistentImdbId, 8.0f);
        });
    }
    
    @Test
    void testGetUserRatingForMovie() throws InstanceNotFoundException, InvalidRatingException {
        // Crear una valoración usando imdbId
        ratingService.rateMovie(testUser.getId(), testMovie.getImdbId(), 6.0f);
        
        // Recuperar la valoración usando imdbId y userId (nota el orden invertido según la interfaz)
        Rating rating = ratingService.getUserRatingForMovie(testMovie.getImdbId(), testUser.getId());
        
        // Verificar los datos
        assertNotNull(rating);
        assertEquals(6, rating.getRating());
        assertEquals(testUser.getId(), rating.getUser().getId());
        assertEquals(testMovie.getId(), rating.getMovie().getId());
    }
    
    @Test
    void testGetNonExistingUserRatingForMovie() throws InstanceNotFoundException {
        // Verificar que se devuelve null para una valoración que no existe usando imdbId y userId
        Rating rating = ratingService.getUserRatingForMovie(testMovie.getImdbId(), testUser.getId());
        assertNull(rating);
    }
    
    @Test
    void testGetUserRatingWithNonExistingUser() {
        // Verificar que se lanza excepción con un usuario que no existe usando imdbId y userId
        assertThrows(InstanceNotFoundException.class, () -> {
            ratingService.getUserRatingForMovie(testMovie.getImdbId(), nonExistentId);
        });
    }
    
    @Test
    void testGetUserRatingWithNonExistingMovie() {
        // Verificar que se lanza excepción con una película que no existe usando imdbId y userId
        assertThrows(InstanceNotFoundException.class, () -> {
            ratingService.getUserRatingForMovie(nonExistentImdbId, testUser.getId());
        });
    }
    
    @Test
    void testGetAverageRatingForMovie() throws InstanceNotFoundException, InvalidRatingException, NoRatingsException {
        // Crear usuarios adicionales para múltiples valoraciones
        Users user2 = new Users();
        user2.setUserName("testUser2");
        user2.setPassword("password");
        user2.setEmail("test2@example.com");
        user2.setAvatar("/images/default-avatar.webp");
        user2.setRole(Users.RoleType.USER);
        user2 = usersDao.save(user2);
        
        Users user3 = new Users();
        user3.setUserName("testUser3");
        user3.setPassword("password");
        user3.setEmail("test3@example.com");
        user3.setAvatar("/images/default-avatar.webp");
        user3.setRole(Users.RoleType.USER);
        user3 = usersDao.save(user3);
        
        // Crear múltiples valoraciones para la misma película usando imdbId
        ratingService.rateMovie(testUser.getId(), testMovie.getImdbId(), 8.0f);
        ratingService.rateMovie(user2.getId(), testMovie.getImdbId(), 6.0f);
        ratingService.rateMovie(user3.getId(), testMovie.getImdbId(), 10.0f);
        
        // Verificar el promedio usando imdbId
        Float average = ratingService.getAverageRatingForMovie(testMovie.getImdbId());
        assertNotNull(average);
        assertEquals(8.0, average, 0.01); // 8 + 6 + 10 = 24, 24/3 = 8.0
    }
    
    @Test
    void testGetAverageRatingForMovieWithNoRatings() {
        // Verificar que se lanza excepción para una película sin valoraciones usando imdbId
        assertThrows(NoRatingsException.class, () -> {
            ratingService.getAverageRatingForMovie(testMovie.getImdbId());
        });
    }
    
    @Test
    void testGetAverageRatingForNonExistingMovie() {
        // Verificar que se lanza excepción con una película que no existe usando imdbId
        assertThrows(InstanceNotFoundException.class, () -> {
            ratingService.getAverageRatingForMovie(nonExistentImdbId);
        });
    }
    
    @Test
    void testGetUserRatings() throws InstanceNotFoundException, InvalidRatingException {
        // Crear valoraciones para varias películas usando imdbId
        ratingService.rateMovie(testUser.getId(), testMovie.getImdbId(), 8.0f);
        ratingService.rateMovie(testUser.getId(), testMovie2.getImdbId(), 7.0f);
        
        // Verificar que se obtienen todas las valoraciones del usuario
        List<Rating> ratings = ratingService.getUserRatings(testUser.getId());
        assertEquals(2, ratings.size());
        
        // Verificar las puntuaciones
        boolean foundMovie1 = false;
        boolean foundMovie2 = false;
        
        for (Rating rating : ratings) {
            assertEquals(testUser.getId(), rating.getUser().getId());
            
            if (rating.getMovie().getId().equals(testMovie.getId())) {
                assertEquals(8, rating.getRating());
                foundMovie1 = true;
            } else if (rating.getMovie().getId().equals(testMovie2.getId())) {
                assertEquals(7, rating.getRating());
                foundMovie2 = true;
            }
        }
        
        assertTrue(foundMovie1, "No se encontró valoración para película 1");
        assertTrue(foundMovie2, "No se encontró valoración para película 2");
    }
    
    @Test
    void testGetUserRatingsForUserWithNoRatings() throws InstanceNotFoundException {
        // Verificar que un usuario sin valoraciones devuelve una lista vacía
        List<Rating> ratings = ratingService.getUserRatings(testUser.getId());
        assertTrue(ratings.isEmpty());
    }
    
    @Test
    void testGetUserRatingsForNonExistingUser() {
        // Verificar que se lanza excepción con un usuario que no existe
        assertThrows(InstanceNotFoundException.class, () -> {
            ratingService.getUserRatings(nonExistentId);
        });
    }
    
    @Test
    void testGetMovieRatings() throws InstanceNotFoundException, InvalidRatingException {
        // Crear usuarios adicionales para múltiples valoraciones
        Users user2 = new Users();
        user2.setUserName("testUser2");
        user2.setPassword("password");
        user2.setEmail("test2@example.com");
        user2.setAvatar("/images/default-avatar.webp");
        user2.setRole(Users.RoleType.USER);
        user2 = usersDao.save(user2);
        
        Users user3 = new Users();
        user3.setUserName("testUser3");
        user3.setPassword("password");
        user3.setEmail("test3@example.com");
        user3.setAvatar("/images/default-avatar.webp");
        user3.setRole(Users.RoleType.USER);
        user3 = usersDao.save(user3);
        
        // Crear múltiples valoraciones para la misma película usando imdbId
        ratingService.rateMovie(testUser.getId(), testMovie.getImdbId(), 8.0f);
        ratingService.rateMovie(user2.getId(), testMovie.getImdbId(), 6.0f);
        ratingService.rateMovie(user3.getId(), testMovie.getImdbId(), 10.0f);
        
        // Verificar que se obtienen todas las valoraciones de la película usando imdbId
        List<Rating> ratings = ratingService.getMovieRatings(testMovie.getImdbId());
        assertEquals(3, ratings.size());
        
        // Verificar las puntuaciones
        boolean foundUser1 = false;
        boolean foundUser2 = false;
        boolean foundUser3 = false;
        
        for (Rating rating : ratings) {
            assertEquals(testMovie.getId(), rating.getMovie().getId());
            
            if (rating.getUser().getId().equals(testUser.getId())) {
                assertEquals(8, rating.getRating());
                foundUser1 = true;
            } else if (rating.getUser().getId().equals(user2.getId())) {
                assertEquals(6, rating.getRating());
                foundUser2 = true;
            } else if (rating.getUser().getId().equals(user3.getId())) {
                assertEquals(10, rating.getRating());
                foundUser3 = true;
            }
        }
        
        assertTrue(foundUser1, "No se encontró valoración del usuario 1");
        assertTrue(foundUser2, "No se encontró valoración del usuario 2");
        assertTrue(foundUser3, "No se encontró valoración del usuario 3");
    }
    
    @Test
    void testGetMovieRatingsForMovieWithNoRatings() throws InstanceNotFoundException {
        // Verificar que una película sin valoraciones devuelve una lista vacía usando imdbId
        List<Rating> ratings = ratingService.getMovieRatings(testMovie.getImdbId());
        assertTrue(ratings.isEmpty());
    }
    
    @Test
    void testGetMovieRatingsForNonExistingMovie() {
        // Verificar que se lanza excepción con una película que no existe usando imdbId
        assertThrows(InstanceNotFoundException.class, () -> {
            ratingService.getMovieRatings(nonExistentImdbId);
        });
    }
    
    @Test
    void testDeleteRating() throws InstanceNotFoundException, InvalidRatingException {
        // Crear una valoración usando imdbId
        ratingService.rateMovie(testUser.getId(), testMovie.getImdbId(), 8.0f);
        
        // Verificar que existe
        assertTrue(ratingDao.findByUserAndMovie(testUser, testMovie).isPresent());
        
        // Eliminar la valoración usando imdbId
        ratingService.deleteRating(testUser.getId(), testMovie.getImdbId());
        
        // Verificar que se ha eliminado
        assertFalse(ratingDao.findByUserAndMovie(testUser, testMovie).isPresent());
    }
    
    @Test
    void testDeleteNonExistingRating() {
        // Verificar que se lanza excepción al eliminar una valoración que no existe usando imdbId
        assertThrows(InstanceNotFoundException.class, () -> {
            ratingService.deleteRating(testUser.getId(), testMovie.getImdbId());
        });
    }
    
    @Test
    void testDeleteRatingWithNonExistingUser() {
        // Verificar que se lanza excepción con un usuario que no existe usando imdbId
        assertThrows(InstanceNotFoundException.class, () -> {
            ratingService.deleteRating(nonExistentId, testMovie.getImdbId());
        });
    }
    
    @Test
    void testDeleteRatingWithNonExistingMovie() {
        // Verificar que se lanza excepción con una película que no existe usando imdbId
        assertThrows(InstanceNotFoundException.class, () -> {
            ratingService.deleteRating(testUser.getId(), nonExistentImdbId);
        });
    }

    @Test
    void testRateMovieWithValidOneDecimalPlace() throws InstanceNotFoundException, InvalidRatingException {
        // Verificar que se acepta un rating con un decimal usando imdbId
        Rating rating = ratingService.rateMovie(testUser.getId(), testMovie.getImdbId(), 7.5f);
        
        assertNotNull(rating);
        assertEquals(7.5f, rating.getRating());
        assertEquals(testUser.getId(), rating.getUser().getId());
        assertEquals(testMovie.getId(), rating.getMovie().getId());
        
        // Verificar que está en la base de datos
        Optional<Rating> savedRating = ratingDao.findByUserAndMovie(testUser, testMovie);
        assertTrue(savedRating.isPresent());
        assertEquals(7.5f, savedRating.get().getRating());
    }

    @Test
    void testRateMovieWithTwoDecimalPlaces() {
        // Verificar que se lanza excepción con dos decimales usando imdbId
        assertThrows(InvalidRatingException.class, () -> {
            ratingService.rateMovie(testUser.getId(), testMovie.getImdbId(), 7.55f);
        });
    }

    @Test
    void testRateMovieWithZeroDecimalPlaces() throws InstanceNotFoundException, InvalidRatingException {
        // Verificar que se acepta un rating sin decimales usando imdbId
        Rating rating = ratingService.rateMovie(testUser.getId(), testMovie.getImdbId(), 7.0f);
        
        assertNotNull(rating);
        assertEquals(7.0f, rating.getRating());
    }

    @Test
    void testRateMovieWithIntegerValue() throws InstanceNotFoundException, InvalidRatingException {
        // Verificar que se acepta un rating entero usando imdbId
        Rating rating = ratingService.rateMovie(testUser.getId(), testMovie.getImdbId(), 7f);
        
        assertNotNull(rating);
        assertEquals(7.0f, rating.getRating());
    }

    @Test
    void testRateMovieWithExtremeValidValues() throws InstanceNotFoundException, InvalidRatingException {
        // Verificar valores extremos válidos (0.0 y 10.0) usando imdbId
        Rating ratingMin = ratingService.rateMovie(testUser.getId(), testMovie.getImdbId(), 0.0f);
        assertNotNull(ratingMin);
        assertEquals(0.0f, ratingMin.getRating());
        
        Rating ratingMax = ratingService.rateMovie(testUser.getId(), testMovie.getImdbId(), 10.0f);
        assertNotNull(ratingMax);
        assertEquals(10.0f, ratingMax.getRating());
    }

    @Test
    void testRateMovieWithDecimalAndUpdate() throws InstanceNotFoundException, InvalidRatingException {
        // Crear una valoración inicial con un decimal usando imdbId
        Rating initialRating = ratingService.rateMovie(testUser.getId(), testMovie.getImdbId(), 7.5f);
        assertEquals(7.5f, initialRating.getRating());
        
        // Actualizar la valoración con otro valor decimal válido usando imdbId
        Rating updatedRating = ratingService.rateMovie(testUser.getId(), testMovie.getImdbId(), 8.5f);
        
        assertEquals(8.5f, updatedRating.getRating());
        assertEquals(testUser.getId(), updatedRating.getUser().getId());
        assertEquals(testMovie.getId(), updatedRating.getMovie().getId());
        
        // Verificar que se actualizó en la base de datos
        Optional<Rating> savedRating = ratingDao.findByUserAndMovie(testUser, testMovie);
        assertTrue(savedRating.isPresent());
        assertEquals(8.5f, savedRating.get().getRating());
    }

    @Test
    void testRateMovieWithMoreThanTwoDecimalPlaces() {
        // Verificar que se lanza excepción con más de dos decimales usando imdbId
        assertThrows(InvalidRatingException.class, () -> {
            ratingService.rateMovie(testUser.getId(), testMovie.getImdbId(), 7.123f);
        });
    }
    
    // Nuevos tests para la funcionalidad de películas mejor valoradas
    
    @Test
    void testGetTopRatedMovies() throws InstanceNotFoundException, InvalidRatingException {
        // Crear géneros
        Genre drama = new Genre();
        drama.setName("Drama");
        genreDao.save(drama);

        Genre comedy = new Genre();
        comedy.setName("Comedia");
        genreDao.save(comedy);
        
        // Configurar películas con géneros
        Set<Genre> dramaGenreSet = new HashSet<>();
        dramaGenreSet.add(drama);
        List<Genre> dramaGenres = new ArrayList<>(dramaGenreSet);
        testMovie.setGenres(dramaGenres);
        movieDao.save(testMovie);
        
        Set<Genre> comedyGenreSet = new HashSet<>();
        comedyGenreSet.add(comedy);
        List<Genre> comedyGenres = new ArrayList<>(comedyGenreSet);
        testMovie2.setGenres(comedyGenres);
        movieDao.save(testMovie2);
        
        // Crear usuario adicional para valoraciones
        Users user2 = new Users();
        user2.setUserName("testUser2");
        user2.setPassword("password");
        user2.setEmail("test2@example.com");
        user2.setAvatar("/images/default-avatar.webp");
        user2.setRole(Users.RoleType.USER);
        user2 = usersDao.save(user2);
        
        // Crear valoraciones
        ratingService.rateMovie(testUser.getId(), testMovie.getImdbId(), 9.0f); 
        ratingService.rateMovie(user2.getId(), testMovie.getImdbId(), 8.0f);
        
        ratingService.rateMovie(testUser.getId(), testMovie2.getImdbId(), 7.5f); 
        
        // Test: Obtener todas las películas mejor valoradas
        List<Movie> allTopRatedMovies = ratingService.getTopRatedMovies(null, null, 10, 0);
        
        // Verificar que devuelve las películas en orden de valoración
        assertEquals(2, allTopRatedMovies.size());
        assertEquals(testMovie.getImdbId(), allTopRatedMovies.get(0).getImdbId()); // Primera es testMovie con promedio de 8.5
        assertEquals(testMovie2.getImdbId(), allTopRatedMovies.get(1).getImdbId()); // Segunda es testMovie2 con promedio de 7.5
        
        // Test: Filtrar por género Drama
        List<Movie> dramaMovies = ratingService.getTopRatedMovies("Drama", null, 10, 0);
        assertEquals(1, dramaMovies.size());
        assertEquals(testMovie.getImdbId(), dramaMovies.get(0).getImdbId());
        
        // Test: Filtrar por género Comedia
        List<Movie> comedyMovies = ratingService.getTopRatedMovies("Comedia", null, 10, 0);
        assertEquals(1, comedyMovies.size());
        assertEquals(testMovie2.getImdbId(), comedyMovies.get(0).getImdbId());
        
        // Test: Filtrar por año 2023
        List<Movie> movies2023 = ratingService.getTopRatedMovies(null, 2023, 10, 0);
        assertEquals(1, movies2023.size());
        assertEquals(testMovie.getImdbId(), movies2023.get(0).getImdbId());
        
        // Test: Filtrar por año 2022
        List<Movie> movies2022 = ratingService.getTopRatedMovies(null, 2022, 10, 0);
        assertEquals(1, movies2022.size());
        assertEquals(testMovie2.getImdbId(), movies2022.get(0).getImdbId());
        
        // Test: Filtrar por género y año
        List<Movie> dramMovies2023 = ratingService.getTopRatedMovies("Drama", 2023, 10, 0);
        assertEquals(1, dramMovies2023.size());
        assertEquals(testMovie.getImdbId(), dramMovies2023.get(0).getImdbId());
        
        // Test: Filtrar por género y año sin coincidencias
        List<Movie> comedyMovies2023 = ratingService.getTopRatedMovies("Comedia", 2023, 10, 0);
        assertEquals(0, comedyMovies2023.size());
        
        // Test: Probar paginación
        List<Movie> pagedMovies = ratingService.getTopRatedMovies(null, null, 1, 0);
        assertEquals(1, pagedMovies.size());
        assertEquals(testMovie.getImdbId(), pagedMovies.get(0).getImdbId());
        
        List<Movie> secondPageMovies = ratingService.getTopRatedMovies(null, null, 1, 1);
        assertEquals(1, secondPageMovies.size());
        assertEquals(testMovie2.getImdbId(), secondPageMovies.get(0).getImdbId());
    }
    
    @Test
    void testGetTopRatedMoviesWithNoRatings() {
        // Verificar que una consulta sin valoraciones devuelve una lista vacía
        List<Movie> movies = ratingService.getTopRatedMovies(null, null, 10, 0);
        assertTrue(movies.isEmpty());
    }
    
    @Test
    void testGetTopRatedMoviesWithNonExistingGenre() {
        // Verificar que un género no existente devuelve lista vacía
        List<Movie> movies = ratingService.getTopRatedMovies("GeneroNoExistente", null, 10, 0);
        assertTrue(movies.isEmpty());
    }
    
    @Test
    void testGetTopRatedMoviesWithNonExistingYear() {
        // Verificar que un año sin películas devuelve lista vacía
        List<Movie> movies = ratingService.getTopRatedMovies(null, 1900, 10, 0);
        assertTrue(movies.isEmpty());
    }
}