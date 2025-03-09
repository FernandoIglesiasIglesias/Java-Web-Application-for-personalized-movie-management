package com.tfg.tfg.model.services;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.tfg.tfg.model.entities.Actor;
import com.tfg.tfg.model.entities.CustomList;
import com.tfg.tfg.model.entities.CustomListDao;
import com.tfg.tfg.model.entities.Director;
import com.tfg.tfg.model.entities.Genre;
import com.tfg.tfg.model.entities.Movie;
import com.tfg.tfg.model.entities.MovieDao;
import com.tfg.tfg.model.entities.Users;
import com.tfg.tfg.model.entities.UsersDao;
import com.tfg.tfg.model.services.exceptions.DuplicateInstanceException;
import com.tfg.tfg.model.services.exceptions.InstanceNotFoundException;
import com.tfg.tfg.model.services.exceptions.PermissionException;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
public class CustomListServiceTest {

    private final Long NON_EXISTENT_ID = -1L;

    @Autowired
    private CustomListService customListService;

    @Autowired
    private UserService userService;

    @Autowired
    private MovieService movieService;

    @Autowired
    private CustomListDao customListDao;

    @Autowired
    private UsersDao usersDao;

    @Autowired
    private MovieDao movieDao;

    private Users testUser;
    private Users anotherUser;
    private Movie testMovie;

    private Movie createMovie(String tbdbId, String title, String overview, int releaseYear, String verticalPoster, int duration, List<Genre> genres, List<Actor> actors, List<Director> directors) {
        return new Movie(tbdbId, title, overview, releaseYear, verticalPoster, duration, genres, actors, directors);
    }

    @BeforeEach
    public void setUp() throws DuplicateInstanceException {
        // Create a test user
        testUser = new Users("testUser", "password", "test@example.com", "avatar.jpg");
        userService.signUp(testUser);

        // Create another user for permission tests
        anotherUser = new Users("anotherUser", "password", "another@example.com", "avatar2.jpg");
        usersDao.save(anotherUser);

        // Create a test movie
        testMovie = createMovie("tt12345", "Test Movie", "Test Overview", 2023, "poster.jpg", 120, 
                                List.of(), List.of(), List.of());
        testMovie = movieService.saveMovie(testMovie);
    }

    @Test
    public void testCreateList() throws DuplicateInstanceException {
        // Arrange
        String listName = "My Favorites";

        // Act
        CustomList createdList = customListService.createList(listName, testUser);

        // Assert
        assertNotNull(createdList);
        assertNotNull(createdList.getId());
        assertEquals(listName, createdList.getName());
        assertEquals(testUser.getId(), createdList.getUser().getId());
        assertTrue(createdList.getMovies().isEmpty());

        // Verify from database
        assertTrue(customListDao.findById(createdList.getId()).isPresent());
    }

    @Test
    public void testCreateDuplicateList() throws DuplicateInstanceException {
        // Arrange
        String listName = "My Favorites";
        customListService.createList(listName, testUser);

        // Act & Assert
        assertThrows(DuplicateInstanceException.class, () -> {
            customListService.createList(listName, testUser);
        });
    }

    @Test
    public void testGetUserLists() throws InstanceNotFoundException, DuplicateInstanceException {
        // Arrange
        CustomList list1 = customListService.createList("List 1", testUser);
        CustomList list2 = customListService.createList("List 2", testUser);
        customListService.createList("Another List", anotherUser);

        // Act
        List<CustomList> userLists = customListService.getUserLists(testUser.getId());

        // Assert
        assertEquals(2, userLists.size());
        assertTrue(userLists.stream().anyMatch(list -> list.getId().equals(list1.getId())));
        assertTrue(userLists.stream().anyMatch(list -> list.getId().equals(list2.getId())));
    }

    @Test
    public void testGetUserListsNonExistentUser() {
        // Act & Assert
        assertThrows(InstanceNotFoundException.class, () -> {
            customListService.getUserLists(NON_EXISTENT_ID);
        });
    }

    @Test
    public void testGetListById() throws InstanceNotFoundException, PermissionException, DuplicateInstanceException {
        // Arrange
        CustomList createdList = customListService.createList("Test List", testUser);

        // Act
        CustomList retrievedList = customListService.getListById(createdList.getId(), testUser.getId());

        // Assert
        assertEquals(createdList.getId(), retrievedList.getId());
        assertEquals("Test List", retrievedList.getName());
    }

    @Test
    public void testGetListByIdWithWrongUser() throws DuplicateInstanceException {
        // Arrange
        CustomList createdList = customListService.createList("Test List", testUser);

        // Act & Assert
        assertThrows(PermissionException.class, () -> {
            customListService.getListById(createdList.getId(), anotherUser.getId());
        });
    }

    @Test
    public void testGetNonExistentList() {
        // Act & Assert
        assertThrows(InstanceNotFoundException.class, () -> {
            customListService.getListById(NON_EXISTENT_ID, testUser.getId());
        });
    }

    @Test
    public void testUpdateListName() throws InstanceNotFoundException, PermissionException, DuplicateInstanceException {
        // Arrange
        CustomList createdList = customListService.createList("Original Name", testUser);
        String newName = "Updated Name";

        // Act
        CustomList updatedList = customListService.updateListName(createdList.getId(), testUser.getId(), newName);

        // Assert
        assertEquals(newName, updatedList.getName());

        // Verify from database
        CustomList retrievedList = customListDao.findById(createdList.getId()).orElseThrow();
        assertEquals(newName, retrievedList.getName());
    }

    @Test
    public void testUpdateNonExistentList() {
        // Act & Assert
        assertThrows(InstanceNotFoundException.class, () -> {
            customListService.updateListName(NON_EXISTENT_ID, testUser.getId(), "New Name");
        });
    }

    @Test
    public void testUpdateListWithDuplicateName() throws DuplicateInstanceException, InstanceNotFoundException, PermissionException {
        // Arrange
        CustomList list1 = customListService.createList("List 1", testUser);
        CustomList list2 = customListService.createList("List 2", testUser);

        // Act & Assert
        assertThrows(DuplicateInstanceException.class, () -> {
            customListService.updateListName(list2.getId(), testUser.getId(), "List 1");
        });
    }

    @Test
    public void testUpdateListWithWrongUser() throws DuplicateInstanceException {
        // Arrange
        CustomList createdList = customListService.createList("Original Name", testUser);
        
        // Act & Assert
        assertThrows(PermissionException.class, () -> {
            customListService.updateListName(createdList.getId(), anotherUser.getId(), "New Name");
        });
    }

    @Test
    public void testDeleteList() throws InstanceNotFoundException, PermissionException, DuplicateInstanceException {
        // Arrange
        CustomList createdList = customListService.createList("List to Delete", testUser);

        // Act
        customListService.deleteList(createdList.getId(), testUser.getId());

        // Assert
        assertFalse(customListDao.existsById(createdList.getId()));
    }

    @Test
    public void testDeleteNonExistentList() {
        // Act & Assert
        assertThrows(InstanceNotFoundException.class, () -> {
            customListService.deleteList(NON_EXISTENT_ID, testUser.getId());
        });
    }

    @Test
    public void testDeleteListWithWrongUser() throws DuplicateInstanceException {
        // Arrange
        CustomList createdList = customListService.createList("List to Delete", testUser);
        
        // Act & Assert
        assertThrows(PermissionException.class, () -> {
            customListService.deleteList(createdList.getId(), anotherUser.getId());
        });
    }

    @Test
    public void testAddMovieToList() throws InstanceNotFoundException, PermissionException, DuplicateInstanceException {
        // Arrange
        CustomList createdList = customListService.createList("Movie List", testUser);

        // Act
        CustomList updatedList = customListService.addMovieToList(createdList.getId(), testUser.getId(), testMovie);

        // Assert
        assertEquals(1, updatedList.getMovies().size());
        assertEquals(testMovie.getId(), updatedList.getMovies().get(0).getId());

        // Verify from database
        CustomList retrievedList = customListDao.findById(createdList.getId()).orElseThrow();
        assertEquals(1, retrievedList.getMovies().size());
    }

    @Test
    public void testAddNewMovieToList() throws InstanceNotFoundException, PermissionException, DuplicateInstanceException {
        // Arrange
        CustomList createdList = customListService.createList("Movie List", testUser);
        // Create a new movie to add to the list
        Movie newMovie = createMovie("tt67890", "New Movie", "New Overview", 2024, "newposter.jpg", 110, 
                        List.of(), List.of(), List.of());

        // Act
        CustomList updatedList = customListService.addMovieToList(createdList.getId(), testUser.getId(), newMovie);

        // Assert
        assertEquals(1, updatedList.getMovies().size());
        
        // The movie should have been saved and have an ID now
        assertNotNull(updatedList.getMovies().get(0).getId());
        assertEquals("New Movie", updatedList.getMovies().get(0).getTitle());

        // Verify the movie was saved in the database
        assertTrue(movieDao.findById(updatedList.getMovies().get(0).getId()).isPresent());
    }

    @Test
    public void testAddDuplicateMovieToList() throws InstanceNotFoundException, PermissionException, DuplicateInstanceException {
        // Arrange
        CustomList createdList = customListService.createList("Movie List", testUser);
        customListService.addMovieToList(createdList.getId(), testUser.getId(), testMovie);

        // Act & Assert
        assertThrows(DuplicateInstanceException.class, () -> {
            customListService.addMovieToList(createdList.getId(), testUser.getId(), testMovie);
        });
    }

    @Test
    public void testAddMovieToNonExistentList() {
        // Act & Assert
        assertThrows(InstanceNotFoundException.class, () -> {
            customListService.addMovieToList(NON_EXISTENT_ID, testUser.getId(), testMovie);
        });
    }

    @Test
    public void testAddMovieToListWithWrongUser() throws DuplicateInstanceException {
        // Arrange
        CustomList createdList = customListService.createList("Movie List", testUser);
        
        // Act & Assert
        assertThrows(PermissionException.class, () -> {
            customListService.addMovieToList(createdList.getId(), anotherUser.getId(), testMovie);
        });
    }

    @Test
    public void testRemoveMovieFromList() throws InstanceNotFoundException, PermissionException, DuplicateInstanceException {
        // Arrange
        CustomList createdList = customListService.createList("Movie List", testUser);
        customListService.addMovieToList(createdList.getId(), testUser.getId(), testMovie);

        // Act
        CustomList updatedList = customListService.removeMovieFromList(createdList.getId(), testUser.getId(), testMovie.getId());

        // Assert
        assertTrue(updatedList.getMovies().isEmpty());

        // Verify from database
        CustomList retrievedList = customListDao.findById(createdList.getId()).orElseThrow();
        assertTrue(retrievedList.getMovies().isEmpty());
    }

    @Test
    public void testRemoveNonExistentMovieFromList() throws DuplicateInstanceException, InstanceNotFoundException, PermissionException {
        // Arrange
        CustomList createdList = customListService.createList("Movie List", testUser);

        // Act & Assert
        assertThrows(InstanceNotFoundException.class, () -> {
            customListService.removeMovieFromList(createdList.getId(), testUser.getId(), NON_EXISTENT_ID);
        });
    }

    @Test
    public void testRemoveMovieFromNonExistentList() {
        // Act & Assert
        assertThrows(InstanceNotFoundException.class, () -> {
            customListService.removeMovieFromList(NON_EXISTENT_ID, testUser.getId(), testMovie.getId());
        });
    }

    @Test
    public void testRemoveMovieFromListWithWrongUser() throws DuplicateInstanceException, InstanceNotFoundException, PermissionException {
        // Arrange
        CustomList createdList = customListService.createList("Movie List", testUser);
        customListService.addMovieToList(createdList.getId(), testUser.getId(), testMovie);
        
        // Act & Assert
        assertThrows(PermissionException.class, () -> {
            customListService.removeMovieFromList(createdList.getId(), anotherUser.getId(), testMovie.getId());
        });
    }
}