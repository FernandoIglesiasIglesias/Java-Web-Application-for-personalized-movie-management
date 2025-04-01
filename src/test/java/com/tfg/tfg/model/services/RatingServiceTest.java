package com.tfg.tfg.model.services;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
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

@SpringBootTest
@Transactional
@ActiveProfiles("test")
class RatingServiceTest {

    private final Long nonExistentId = -1L;
    
    @Autowired
    private RatingService ratingService;
    
    @Autowired
    private UsersDao usersDao;
    
    @Autowired
    private MovieDao movieDao;
    
    @Autowired
    private RatingDao ratingDao;
    
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
        // Crear una valoración
        Rating rating = ratingService.rateMovie(testUser.getId(), testMovie.getId(), 8.0f);
        
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
        // Crear una valoración inicial
        Rating initialRating = ratingService.rateMovie(testUser.getId(), testMovie.getId(), 7.0f);
        assertEquals(7, initialRating.getRating());
        
        // Actualizar la valoración
        Rating updatedRating = ratingService.rateMovie(testUser.getId(), testMovie.getId(), 9.0f);
        
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
        // Verificar que se lanza excepción con valor debajo del mínimo
        assertThrows(InvalidRatingException.class, () -> {
            ratingService.rateMovie(testUser.getId(), testMovie.getId(), -1.0f);
        });
    }
    
    @Test
    void testRateMovieWithInvalidRatingTooHigh() {
        // Verificar que se lanza excepción con valor por encima del máximo
        assertThrows(InvalidRatingException.class, () -> {
            ratingService.rateMovie(testUser.getId(), testMovie.getId(), 11.0f);
        });
    }
    
    @Test
    void testRateMovieWithNonExistingUser() {
        // Verificar que se lanza excepción con un usuario que no existe
        assertThrows(InstanceNotFoundException.class, () -> {
            ratingService.rateMovie(nonExistentId, testMovie.getId(), 8.0f);
        });
    }
    
    @Test
    void testRateMovieWithNonExistingMovie() {
        // Verificar que se lanza excepción con una película que no existe
        assertThrows(InstanceNotFoundException.class, () -> {
            ratingService.rateMovie(testUser.getId(), nonExistentId, 8.0f);
        });
    }
    
    @Test
    void testGetUserRatingForMovie() throws InstanceNotFoundException, InvalidRatingException {
        // Crear una valoración
        ratingService.rateMovie(testUser.getId(), testMovie.getId(), 6.0f);
        
        // Recuperar la valoración
        Rating rating = ratingService.getUserRatingForMovie(testUser.getId(), testMovie.getId());
        
        // Verificar los datos
        assertNotNull(rating);
        assertEquals(6, rating.getRating());
        assertEquals(testUser.getId(), rating.getUser().getId());
        assertEquals(testMovie.getId(), rating.getMovie().getId());
    }
    
    @Test
    void testGetNonExistingUserRatingForMovie() throws InstanceNotFoundException {
        // Verificar que se devuelve null para una valoración que no existe
        Rating rating = ratingService.getUserRatingForMovie(testUser.getId(), testMovie.getId());
        assertNull(rating);
    }
    
    @Test
    void testGetUserRatingWithNonExistingUser() {
        // Verificar que se lanza excepción con un usuario que no existe
        assertThrows(InstanceNotFoundException.class, () -> {
            ratingService.getUserRatingForMovie(nonExistentId, testMovie.getId());
        });
    }
    
    @Test
    void testGetUserRatingWithNonExistingMovie() {
        // Verificar que se lanza excepción con una película que no existe
        assertThrows(InstanceNotFoundException.class, () -> {
            ratingService.getUserRatingForMovie(testUser.getId(), nonExistentId);
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
        
        // Crear múltiples valoraciones para la misma película
        ratingService.rateMovie(testUser.getId(), testMovie.getId(), 8.0f);
        ratingService.rateMovie(user2.getId(), testMovie.getId(), 6.0f);
        ratingService.rateMovie(user3.getId(), testMovie.getId(), 10.0f);
        
        // Verificar el promedio
        Float average = ratingService.getAverageRatingForMovie(testMovie.getId());
        assertNotNull(average);
        assertEquals(8.0, average, 0.01); // 8 + 6 + 10 = 24, 24/3 = 8.0
    }
    
    @Test
    void testGetAverageRatingForMovieWithNoRatings() {
        assertThrows(NoRatingsException.class, () -> {
            ratingService.getAverageRatingForMovie(testMovie.getId());
        });
    }
    
    @Test
    void testGetAverageRatingForNonExistingMovie() {
        // Verificar que se lanza excepción con una película que no existe
        assertThrows(InstanceNotFoundException.class, () -> {
            ratingService.getAverageRatingForMovie(nonExistentId);
        });
    }
    
    @Test
    void testGetUserRatings() throws InstanceNotFoundException, InvalidRatingException {
        // Crear valoraciones para varias películas
        ratingService.rateMovie(testUser.getId(), testMovie.getId(), 8.0f);
        ratingService.rateMovie(testUser.getId(), testMovie2.getId(), 7.0f);
        
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
        
        // Crear múltiples valoraciones para la misma película
        ratingService.rateMovie(testUser.getId(), testMovie.getId(), 8.0f);
        ratingService.rateMovie(user2.getId(), testMovie.getId(), 6.0f);
        ratingService.rateMovie(user3.getId(), testMovie.getId(), 10.0f);
        
        // Verificar que se obtienen todas las valoraciones de la película
        List<Rating> ratings = ratingService.getMovieRatings(testMovie.getId());
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
        // Verificar que una película sin valoraciones devuelve una lista vacía
        List<Rating> ratings = ratingService.getMovieRatings(testMovie.getId());
        assertTrue(ratings.isEmpty());
    }
    
    @Test
    void testGetMovieRatingsForNonExistingMovie() {
        // Verificar que se lanza excepción con una película que no existe
        assertThrows(InstanceNotFoundException.class, () -> {
            ratingService.getMovieRatings(nonExistentId);
        });
    }
    
    @Test
    void testDeleteRating() throws InstanceNotFoundException, InvalidRatingException {
        // Crear una valoración
        ratingService.rateMovie(testUser.getId(), testMovie.getId(), 8.0f);
        
        // Verificar que existe
        assertTrue(ratingDao.findByUserAndMovie(testUser, testMovie).isPresent());
        
        // Eliminar la valoración
        ratingService.deleteRating(testUser.getId(), testMovie.getId());
        
        // Verificar que se ha eliminado
        assertFalse(ratingDao.findByUserAndMovie(testUser, testMovie).isPresent());
    }
    
    @Test
    void testDeleteNonExistingRating() {
        // Verificar que se lanza excepción al eliminar una valoración que no existe
        assertThrows(InstanceNotFoundException.class, () -> {
            ratingService.deleteRating(testUser.getId(), testMovie.getId());
        });
    }
    
    @Test
    void testDeleteRatingWithNonExistingUser() {
        // Verificar que se lanza excepción con un usuario que no existe
        assertThrows(InstanceNotFoundException.class, () -> {
            ratingService.deleteRating(nonExistentId, testMovie.getId());
        });
    }
    
    @Test
    void testDeleteRatingWithNonExistingMovie() {
        // Verificar que se lanza excepción con una película que no existe
        assertThrows(InstanceNotFoundException.class, () -> {
            ratingService.deleteRating(testUser.getId(), nonExistentId);
        });
    }

    @Test
    void testRateMovieWithValidOneDecimalPlace() throws InstanceNotFoundException, InvalidRatingException {
        // Verificar que se acepta un rating con un decimal
        Rating rating = ratingService.rateMovie(testUser.getId(), testMovie.getId(), 7.5f);
        
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
        // Verificar que se lanza excepción con dos decimales
        assertThrows(InvalidRatingException.class, () -> {
            ratingService.rateMovie(testUser.getId(), testMovie.getId(), 7.55f);
        });
    }

    @Test
    void testRateMovieWithZeroDecimalPlaces() throws InstanceNotFoundException, InvalidRatingException {
        // Verificar que se acepta un rating sin decimales
        Rating rating = ratingService.rateMovie(testUser.getId(), testMovie.getId(), 7.0f);
        
        assertNotNull(rating);
        assertEquals(7.0f, rating.getRating());
    }

    @Test
    void testRateMovieWithIntegerValue() throws InstanceNotFoundException, InvalidRatingException {
        // Verificar que se acepta un rating entero
        Rating rating = ratingService.rateMovie(testUser.getId(), testMovie.getId(), 7f);
        
        assertNotNull(rating);
        assertEquals(7.0f, rating.getRating());
    }

    @Test
    void testRateMovieWithExtremeValidValues() throws InstanceNotFoundException, InvalidRatingException {
        // Verificar valores extremos válidos (0.0 y 10.0)
        Rating ratingMin = ratingService.rateMovie(testUser.getId(), testMovie.getId(), 0.0f);
        assertNotNull(ratingMin);
        assertEquals(0.0f, ratingMin.getRating());
        
        Rating ratingMax = ratingService.rateMovie(testUser.getId(), testMovie.getId(), 10.0f);
        assertNotNull(ratingMax);
        assertEquals(10.0f, ratingMax.getRating());
    }

    @Test
    void testRateMovieWithDecimalAndUpdate() throws InstanceNotFoundException, InvalidRatingException {
        // Crear una valoración inicial con un decimal
        Rating initialRating = ratingService.rateMovie(testUser.getId(), testMovie.getId(), 7.5f);
        assertEquals(7.5f, initialRating.getRating());
        
        // Actualizar la valoración con otro valor decimal válido
        Rating updatedRating = ratingService.rateMovie(testUser.getId(), testMovie.getId(), 8.5f);
        
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
        // Verificar que se lanza excepción con más de dos decimales
        assertThrows(InvalidRatingException.class, () -> {
            ratingService.rateMovie(testUser.getId(), testMovie.getId(), 7.123f);
        });
    }
}