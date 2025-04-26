package com.tfg.tfg.model.services;

import static org.junit.jupiter.api.Assertions.*;

import java.util.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.tfg.tfg.model.entities.*;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
public class RecommendationServiceTest {
    
    @Autowired
    private RecommendationService recommendationService;
    
    @Autowired
    private UserActivityDao userActivityDao;
    
    @Autowired
    private UserProfileDao userProfileDao;
    
    @Autowired
    private MovieDao movieDao;
    
    @Autowired
    private UsersDao usersDao;
    
    @Autowired
    private GenreDao genreDao;
    
    @Autowired
    private ActorDao actorDao;
    
    @Autowired
    private DirectorDao directorDao;
    
    @Autowired
    private CustomListDao customListDao;
    
    @Autowired
    private CustomListService customListService;

    @Autowired
    private UserService userService;
    
    private Users testUser;
    private Movie testMovie1;
    private Movie testMovie2;
    private Movie testMovie3;
    private Movie testMovie4;
    private Genre actionGenre;
    private Genre dramaGenre;
    private Genre comedyGenre;
    private Actor actor1;
    private Actor actor2;
    private Director director1;
    
    @BeforeEach
    public void setUp() throws Exception {
        // Limpiar datos de pruebas anteriores
        userActivityDao.deleteAll();
        userProfileDao.deleteAll();
        customListDao.deleteAll();
        movieDao.deleteAll();
        genreDao.deleteAll();
        actorDao.deleteAll();
        directorDao.deleteAll();
        usersDao.deleteAll();
        
        // Crear usuario de prueba usando signUp para que genere las listas predeterminadas
        testUser = new Users();
        testUser.setUserName("testUser");
        testUser.setPassword("password");
        testUser.setEmail("test@example.com");
        testUser.setAvatar("/images/default-avatar.webp");
        userService.signUp(testUser);
        // Recuperar el usuario guardado para tener el ID y otros campos generados
        testUser = usersDao.findByUserName("testUser").orElseThrow();
        
        // Crear géneros
        actionGenre = new Genre();
        actionGenre.setName("Action");
        actionGenre = genreDao.save(actionGenre);
        
        dramaGenre = new Genre();
        dramaGenre.setName("Drama");
        dramaGenre = genreDao.save(dramaGenre);
        
        comedyGenre = new Genre();
        comedyGenre.setName("Comedia");
        comedyGenre = genreDao.save(comedyGenre);
        
        // Crear actores
        actor1 = new Actor();
        actor1.setName("Robert Downey Jr.");
        actor1.setImdbId("nm0000375");
        actor1 = actorDao.save(actor1);
        
        actor2 = new Actor();
        actor2.setName("Scarlett Johansson");
        actor2.setImdbId("nm0424060");
        actor2 = actorDao.save(actor2);
        
        // Crear directores
        director1 = new Director();
        director1.setName("Christopher Nolan");
        director1.setImdbId("nm0634240");
        director1 = directorDao.save(director1);
        
        // Crear películas
        testMovie1 = new Movie();
        testMovie1.setImdbId("tt0468569");
        testMovie1.setTitle("The Dark Knight");
        testMovie1.setOverview("Batman fights the Joker");
        testMovie1.setReleaseYear(2008);
        testMovie1.setRuntime(152);
        testMovie1.setGenres(List.of(actionGenre, dramaGenre));
        testMovie1.setActors(List.of(actor1));
        testMovie1.setDirectors(List.of(director1));
        testMovie1 = movieDao.save(testMovie1);
        
        testMovie2 = new Movie();
        testMovie2.setImdbId("tt1375666");
        testMovie2.setTitle("Inception");
        testMovie2.setOverview("Dream within a dream");
        testMovie2.setReleaseYear(2010);
        testMovie2.setRuntime(148);
        testMovie2.setGenres(List.of(actionGenre));
        testMovie2.setActors(List.of(actor2));
        testMovie2.setDirectors(List.of(director1));
        testMovie2 = movieDao.save(testMovie2);
        
        testMovie3 = new Movie();
        testMovie3.setImdbId("tt0111161");
        testMovie3.setTitle("The Shawshank Redemption");
        testMovie3.setOverview("Two imprisoned men bond over a number of years");
        testMovie3.setReleaseYear(1994);
        testMovie3.setRuntime(142);
        testMovie3.setGenres(List.of(dramaGenre));
        testMovie3.setActors(new ArrayList<>());
        testMovie3.setDirectors(new ArrayList<>());
        testMovie3 = movieDao.save(testMovie3);
        
        testMovie4 = new Movie();
        testMovie4.setImdbId("tt0109830");
        testMovie4.setTitle("Forrest Gump");
        testMovie4.setOverview("Life is like a box of chocolates");
        testMovie4.setReleaseYear(1994);
        testMovie4.setRuntime(142);
        testMovie4.setGenres(List.of(dramaGenre, comedyGenre));
        testMovie4.setActors(new ArrayList<>());
        testMovie4.setDirectors(new ArrayList<>());
        testMovie4 = movieDao.save(testMovie4);
    }
    
    @Test
    public void testRecordUserActivity() {
        // Registro de una visualización
        recommendationService.recordUserActivity(testUser.getId(), testMovie1.getId(), "VIEW", null, null);
        
        // Verificar que se guardó la actividad
        List<UserActivity> activities = userActivityDao.findByUserIdOrderByTimestampDesc(testUser.getId());
        assertEquals(1, activities.size());
        assertEquals("VIEW", activities.get(0).getActivityType());
        assertEquals(testMovie1.getId(), activities.get(0).getMovieId());
        
        // Verificar que se creó el perfil
        UserProfile profile = userProfileDao.findByUserId(testUser.getId());
        assertNotNull(profile);
        
        // Verificar que se calcularon las preferencias
        assertTrue(profile.getGenrePreferences().containsKey("Action"));
        assertTrue(profile.getGenrePreferences().containsKey("Drama"));
        assertTrue(profile.getActorPreferences().containsKey("Robert Downey Jr."));
        assertTrue(profile.getDirectorPreferences().containsKey("Christopher Nolan"));
    }
    
    @Test
    public void testRecordRatingActivity() {
        // Registro de una valoración
        Double rating = 8.0;
        recommendationService.recordUserActivity(testUser.getId(), testMovie1.getId(), "RATE", rating, null);
        
        // Verificar que se guardó la actividad
        List<UserActivity> activities = userActivityDao.findByUserIdOrderByTimestampDesc(testUser.getId());
        assertEquals(1, activities.size());
        assertEquals("RATE", activities.get(0).getActivityType());
        assertEquals(rating, activities.get(0).getRating());
        
        // Verificar preferencias - deben tener mayor peso
        UserProfile profile = userProfileDao.findByUserId(testUser.getId());
        assertNotNull(profile);
        
        double actionWeight = profile.getGenrePreferences().get("Action");
        double dramaWeight = profile.getGenrePreferences().get("Drama");
        
        // Las valoraciones tienen más peso que las vistas simples
        assertTrue(actionWeight > 1.0);
        assertTrue(dramaWeight > 1.0);
    }
    
    @Test
    public void testRecordSearchActivity() {
        // Registro de una búsqueda
        String searchParams = "genre:Action year:2010";
        recommendationService.recordUserActivity(testUser.getId(), null, "SEARCH", null, searchParams);
        
        // Verificar que se guardó la actividad
        List<UserActivity> activities = userActivityDao.findByUserIdOrderByTimestampDesc(testUser.getId());
        assertEquals(1, activities.size());
        assertEquals("SEARCH", activities.get(0).getActivityType());
        assertEquals(searchParams, activities.get(0).getSearchParams());
        assertNull(activities.get(0).getMovieId());
    }
    
    @Test
    public void testGetRecommendationsWithEmptyProfile() {
        // Sin actividad previa, no debería haber recomendaciones personalizadas
        List<Movie> recommendations = recommendationService.getRecommendations(testUser.getId(), 10);
        assertTrue(recommendations.isEmpty());
    }
    
    @Test
    public void testGetRecommendationsIncludesViewedMovies() {
        // El usuario ve una película de acción/drama
        recommendationService.recordUserActivity(testUser.getId(), testMovie1.getId(), "VIEW", null, null);
        
        // Obtener recomendaciones
        List<Movie> recommendations = recommendationService.getRecommendations(testUser.getId(), 10);
        
        // Debe recomendar películas incluyendo la vista (ya que solo excluimos películas valoradas)
        assertFalse(recommendations.isEmpty());
        assertTrue(recommendations.contains(testMovie2)); // Debe recomendar Inception
        
        // Verificamos que las vistas no son excluidas de las recomendaciones
        assertTrue(recommendations.contains(testMovie1)); // Debe incluir la película vista
    }
    
    @Test
    public void testGetRecommendationsExcludesRatedMovies() {
        // El usuario califica una película
        recommendationService.recordUserActivity(testUser.getId(), testMovie1.getId(), "RATE", 8.0, null);
        
        // Obtener recomendaciones
        List<Movie> recommendations = recommendationService.getRecommendations(testUser.getId(), 10);
        
        // No debe recomendar la película valorada
        assertFalse(recommendations.isEmpty());
        assertFalse(recommendations.contains(testMovie1)); // No debe recomendar la película valorada
    }
    
    @Test
    public void testGetRecommendationsExcludesMoviesInWatchedList() {
        try {
            // Primero creamos un perfil para el usuario con actividades
            recommendationService.recordUserActivity(testUser.getId(), testMovie2.getId(), "VIEW", null, null);
            
            // Buscar la lista "Películas vistas" que ya debería existir por el proceso de signUp
            List<CustomList> userLists = customListDao.findByUserId(testUser.getId());
            CustomList watchedList = userLists.stream()
                .filter(list -> "Películas vistas".equalsIgnoreCase(list.getName()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("La lista 'Películas vistas' debería existir por defecto"));
            
            // Añadir película3 a la lista "Películas vistas"
            customListService.addMovieToList(watchedList.getId(), testUser.getId(), testMovie3);
            
            // Obtener recomendaciones
            List<Movie> recommendations = recommendationService.getRecommendations(testUser.getId(), 10);
            
            // Debe excluir la película de la lista "Películas vistas"
            assertFalse(recommendations.contains(testMovie3));
        } catch (Exception e) {
            fail("No debería lanzar excepción: " + e.getMessage());
        }
    }
    
    @Test
    public void testGetRecommendationsWithViewAndRateActivities() {
        // El usuario ve una película
        recommendationService.recordUserActivity(testUser.getId(), testMovie1.getId(), "VIEW", null, null);
        
        // El usuario valora otra película
        recommendationService.recordUserActivity(testUser.getId(), testMovie3.getId(), "RATE", 9.0, null);
        
        // Obtener recomendaciones
        List<Movie> recommendations = recommendationService.getRecommendations(testUser.getId(), 10);
        
        // Debe incluir la película vista
        assertTrue(recommendations.contains(testMovie1));
        
        // Debe excluir la película valorada
        assertFalse(recommendations.contains(testMovie3));
    }
    
    @Test
    public void testGetRecommendationsBasedOnViews() {
        // El usuario ve una película de acción/drama
        recommendationService.recordUserActivity(testUser.getId(), testMovie2.getId(), "VIEW", null, null);
        
        // Obtener recomendaciones
        List<Movie> recommendations = recommendationService.getRecommendations(testUser.getId(), 10);
        
        // Debe recomendar películas no vistas ni valoradas
        assertFalse(recommendations.isEmpty());
        
        // Dark Knight debe estar en las recomendaciones por tener el mismo director y el género acción
        assertTrue(recommendations.contains(testMovie1));
        
        // Inception debe incluirse aunque se haya visto (no valorado)
        assertTrue(recommendations.contains(testMovie2));
    }
    
    @Test
    public void testGetRecommendationsBasedOnRatings() {
        // El usuario califica bien una película de drama
        recommendationService.recordUserActivity(testUser.getId(), testMovie3.getId(), "RATE", 9.0, null);
        
        // Obtener recomendaciones
        List<Movie> recommendations = recommendationService.getRecommendations(testUser.getId(), 10);
        
        // No debe recomendar la película valorada
        assertFalse(recommendations.contains(testMovie3));
        
        // Debe recomendar The Dark Knight y Forrest Gump por tener género drama
        assertTrue(recommendations.contains(testMovie1));
        assertTrue(recommendations.contains(testMovie4));
    }
    
    @Test
    public void testRecommendationsConsiderMultipleActivities() {
        // Ver una película de acción
        recommendationService.recordUserActivity(testUser.getId(), testMovie2.getId(), "VIEW", null, null);
        
        // Calificar una película de drama
        recommendationService.recordUserActivity(testUser.getId(), testMovie3.getId(), "RATE", 9.0, null);
        
        // Obtener recomendaciones
        List<Movie> recommendations = recommendationService.getRecommendations(testUser.getId(), 10);
        
        // No debe recomendar la película valorada
        assertFalse(recommendations.contains(testMovie3));
        
        // Debe recomendar The Dark Knight por tener tanto acción como drama
        assertTrue(recommendations.contains(testMovie1));
        
        // Debe incluir Inception porque fue vista (no valorada)
        assertTrue(recommendations.contains(testMovie2));
        
        // Debe recomendar Forrest Gump por tener drama
        assertTrue(recommendations.contains(testMovie4));
    }
    
    @Test
    public void testUserProfileUpdatesWithNewActivities() {
        // Actividad inicial
        recommendationService.recordUserActivity(testUser.getId(), testMovie1.getId(), "VIEW", null, null);
        
        UserProfile profileBefore = userProfileDao.findByUserId(testUser.getId());
        double initialDramaWeight = profileBefore.getGenrePreferences().get("Drama");
        
        // Actividad adicional - calificar bien una película de drama
        recommendationService.recordUserActivity(testUser.getId(), testMovie3.getId(), "RATE", 9.0, null);
        
        UserProfile profileAfter = userProfileDao.findByUserId(testUser.getId());
        double finalDramaWeight = profileAfter.getGenrePreferences().get("Drama");
        
        // El peso del género Drama debe haber aumentado significativamente
        assertTrue(finalDramaWeight > initialDramaWeight);
    }
}