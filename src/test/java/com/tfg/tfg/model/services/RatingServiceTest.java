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

@SpringBootTest
@Transactional
@ActiveProfiles("test")
public class RatingServiceTest {

    private final Long NON_EXISTENT_ID = -1L;
    
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
    public void setUp() {
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
    public void testRateMovie() throws InstanceNotFoundException, InvalidRatingException {
        // Crear una valoración
        Rating rating = ratingService.rateMovie(testUser.getId(), testMovie.getId(), 8);
        
        // Verificar que la valoración se creó correctamente
        assertNotNull(rating);
        assertEquals(8, rating.getRating());
        assertEquals(testUser.getId(), rating.getUser().getId());
        assertEquals(testMovie.getId(), rating.getMovie().getId());
        
        // Verificar que está en la base de datos
        Optional<Rating> savedRating = ratingDao.findByUserAndMovie(testUser, testMovie);
        assertTrue(savedRating.isPresent());
        assertEquals(8, savedRating.get().getRating());
    }
    
    @Test
    public void testUpdateRating() throws InstanceNotFoundException, InvalidRatingException {
        // Crear una valoración inicial
        Rating initialRating = ratingService.rateMovie(testUser.getId(), testMovie.getId(), 7);
        assertEquals(7, initialRating.getRating());
        
        // Actualizar la valoración
        Rating updatedRating = ratingService.rateMovie(testUser.getId(), testMovie.getId(), 9);
        
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
    public void testRateMovieWithInvalidRatingTooLow() {
        // Verificar que se lanza excepción con valor debajo del mínimo
        assertThrows(InvalidRatingException.class, () -> {
            ratingService.rateMovie(testUser.getId(), testMovie.getId(), -1);
        });
    }
    
    @Test
    public void testRateMovieWithInvalidRatingTooHigh() {
        // Verificar que se lanza excepción con valor por encima del máximo
        assertThrows(InvalidRatingException.class, () -> {
            ratingService.rateMovie(testUser.getId(), testMovie.getId(), 11);
        });
    }
    
    @Test
    public void testRateMovieWithNonExistingUser() {
        // Verificar que se lanza excepción con un usuario que no existe
        assertThrows(InstanceNotFoundException.class, () -> {
            ratingService.rateMovie(NON_EXISTENT_ID, testMovie.getId(), 8);
        });
    }
    
    @Test
    public void testRateMovieWithNonExistingMovie() {
        // Verificar que se lanza excepción con una película que no existe
        assertThrows(InstanceNotFoundException.class, () -> {
            ratingService.rateMovie(testUser.getId(), NON_EXISTENT_ID, 8);
        });
    }
    
    @Test
    public void testGetUserRatingForMovie() throws InstanceNotFoundException, InvalidRatingException {
        // Crear una valoración
        ratingService.rateMovie(testUser.getId(), testMovie.getId(), 6);
        
        // Recuperar la valoración
        Rating rating = ratingService.getUserRatingForMovie(testUser.getId(), testMovie.getId());
        
        // Verificar los datos
        assertNotNull(rating);
        assertEquals(6, rating.getRating());
        assertEquals(testUser.getId(), rating.getUser().getId());
        assertEquals(testMovie.getId(), rating.getMovie().getId());
    }
    
    @Test
    public void testGetNonExistingUserRatingForMovie() throws InstanceNotFoundException {
        // Verificar que se devuelve null para una valoración que no existe
        Rating rating = ratingService.getUserRatingForMovie(testUser.getId(), testMovie.getId());
        assertNull(rating);
    }
    
    @Test
    public void testGetUserRatingWithNonExistingUser() {
        // Verificar que se lanza excepción con un usuario que no existe
        assertThrows(InstanceNotFoundException.class, () -> {
            ratingService.getUserRatingForMovie(NON_EXISTENT_ID, testMovie.getId());
        });
    }
    
    @Test
    public void testGetUserRatingWithNonExistingMovie() {
        // Verificar que se lanza excepción con una película que no existe
        assertThrows(InstanceNotFoundException.class, () -> {
            ratingService.getUserRatingForMovie(testUser.getId(), NON_EXISTENT_ID);
        });
    }
    
    @Test
    public void testGetAverageRatingForMovie() throws InstanceNotFoundException, InvalidRatingException {
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
        ratingService.rateMovie(testUser.getId(), testMovie.getId(), 8);
        ratingService.rateMovie(user2.getId(), testMovie.getId(), 6);
        ratingService.rateMovie(user3.getId(), testMovie.getId(), 10);
        
        // Verificar el promedio
        Double average = ratingService.getAverageRatingForMovie(testMovie.getId());
        assertNotNull(average);
        assertEquals(8.0, average, 0.01); // 8 + 6 + 10 = 24, 24/3 = 8.0
    }
    
    @Test
    public void testGetAverageRatingForMovieWithNoRatings() throws InstanceNotFoundException {
        // Verificar que una película sin valoraciones devuelve null
        Double average = ratingService.getAverageRatingForMovie(testMovie.getId());
        assertNull(average);
    }
    
    @Test
    public void testGetAverageRatingForNonExistingMovie() {
        // Verificar que se lanza excepción con una película que no existe
        assertThrows(InstanceNotFoundException.class, () -> {
            ratingService.getAverageRatingForMovie(NON_EXISTENT_ID);
        });
    }
    
    @Test
    public void testGetUserRatings() throws InstanceNotFoundException, InvalidRatingException {
        // Crear valoraciones para varias películas
        ratingService.rateMovie(testUser.getId(), testMovie.getId(), 8);
        ratingService.rateMovie(testUser.getId(), testMovie2.getId(), 7);
        
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
    public void testGetUserRatingsForUserWithNoRatings() throws InstanceNotFoundException {
        // Verificar que un usuario sin valoraciones devuelve una lista vacía
        List<Rating> ratings = ratingService.getUserRatings(testUser.getId());
        assertTrue(ratings.isEmpty());
    }
    
    @Test
    public void testGetUserRatingsForNonExistingUser() {
        // Verificar que se lanza excepción con un usuario que no existe
        assertThrows(InstanceNotFoundException.class, () -> {
            ratingService.getUserRatings(NON_EXISTENT_ID);
        });
    }
    
    @Test
    public void testGetMovieRatings() throws InstanceNotFoundException, InvalidRatingException {
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
        ratingService.rateMovie(testUser.getId(), testMovie.getId(), 8);
        ratingService.rateMovie(user2.getId(), testMovie.getId(), 6);
        ratingService.rateMovie(user3.getId(), testMovie.getId(), 10);
        
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
    public void testGetMovieRatingsForMovieWithNoRatings() throws InstanceNotFoundException {
        // Verificar que una película sin valoraciones devuelve una lista vacía
        List<Rating> ratings = ratingService.getMovieRatings(testMovie.getId());
        assertTrue(ratings.isEmpty());
    }
    
    @Test
    public void testGetMovieRatingsForNonExistingMovie() {
        // Verificar que se lanza excepción con una película que no existe
        assertThrows(InstanceNotFoundException.class, () -> {
            ratingService.getMovieRatings(NON_EXISTENT_ID);
        });
    }
    
    @Test
    public void testDeleteRating() throws InstanceNotFoundException, InvalidRatingException {
        // Crear una valoración
        ratingService.rateMovie(testUser.getId(), testMovie.getId(), 8);
        
        // Verificar que existe
        assertTrue(ratingDao.findByUserAndMovie(testUser, testMovie).isPresent());
        
        // Eliminar la valoración
        ratingService.deleteRating(testUser.getId(), testMovie.getId());
        
        // Verificar que se ha eliminado
        assertFalse(ratingDao.findByUserAndMovie(testUser, testMovie).isPresent());
    }
    
    @Test
    public void testDeleteNonExistingRating() {
        // Verificar que se lanza excepción al eliminar una valoración que no existe
        assertThrows(InstanceNotFoundException.class, () -> {
            ratingService.deleteRating(testUser.getId(), testMovie.getId());
        });
    }
    
    @Test
    public void testDeleteRatingWithNonExistingUser() {
        // Verificar que se lanza excepción con un usuario que no existe
        assertThrows(InstanceNotFoundException.class, () -> {
            ratingService.deleteRating(NON_EXISTENT_ID, testMovie.getId());
        });
    }
    
    @Test
    public void testDeleteRatingWithNonExistingMovie() {
        // Verificar que se lanza excepción con una película que no existe
        assertThrows(InstanceNotFoundException.class, () -> {
            ratingService.deleteRating(testUser.getId(), NON_EXISTENT_ID);
        });
    }
}