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
import com.tfg.tfg.model.services.exceptions.DuplicateListNameException;
import com.tfg.tfg.model.services.exceptions.EmptyUserListsException;
import com.tfg.tfg.model.services.exceptions.InstanceNotFoundException;
import com.tfg.tfg.model.services.exceptions.MovieAlreadyInListException;
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
    public void testCreateList() throws DuplicateListNameException {
        String listName = "My Favorites";

        CustomList createdList = customListService.createList(listName, testUser);

        assertNotNull(createdList);
        assertNotNull(createdList.getId());
        assertEquals(listName, createdList.getName());
        assertEquals(testUser.getId(), createdList.getUser().getId());
        assertTrue(createdList.getMovies().isEmpty());

        assertTrue(customListDao.findById(createdList.getId()).isPresent());
    }

    @Test
    public void testCreateDuplicateList() throws DuplicateListNameException {
        String listName = "My Favorites";
        customListService.createList(listName, testUser);
    
        assertThrows(DuplicateListNameException.class, () -> {
            customListService.createList(listName, testUser);
        });
    }

    @Test
    public void testGetUserLists() throws EmptyUserListsException, InstanceNotFoundException, DuplicateListNameException {
        CustomList list1 = customListService.createList("List 1", testUser);
        CustomList list2 = customListService.createList("List 2", testUser);
        customListService.createList("Another List", anotherUser);

        List<CustomList> userLists = customListService.getUserLists(testUser.getId());

        assertEquals(2, userLists.size());
        assertTrue(userLists.stream().anyMatch(list -> list.getId().equals(list1.getId())));
        assertTrue(userLists.stream().anyMatch(list -> list.getId().equals(list2.getId())));
    }

    @Test
    public void testGetUserListsNonExistentUser() {
        assertThrows(InstanceNotFoundException.class, () -> {
            customListService.getUserLists(NON_EXISTENT_ID);
        });
    }

    @Test
    public void testGetUserListsEmptyLists() {
        assertThrows(EmptyUserListsException.class, () -> {
            customListService.getUserLists(testUser.getId());
        });
    }

    @Test
    public void testGetListById() throws InstanceNotFoundException, PermissionException, DuplicateListNameException {
        CustomList createdList = customListService.createList("Test List", testUser);

        CustomList retrievedList = customListService.getListById(createdList.getId(), testUser.getId());

        assertEquals(createdList.getId(), retrievedList.getId());
        assertEquals("Test List", retrievedList.getName());
    }

    @Test
    public void testGetListByIdWithWrongUser() throws DuplicateListNameException {
        CustomList createdList = customListService.createList("Test List", testUser);

        assertThrows(PermissionException.class, () -> {
            customListService.getListById(createdList.getId(), anotherUser.getId());
        });
    }

    @Test
    public void testGetNonExistentList() {
        assertThrows(InstanceNotFoundException.class, () -> {
            customListService.getListById(NON_EXISTENT_ID, testUser.getId());
        });
    }

    @Test
    public void testUpdateListName() throws InstanceNotFoundException, PermissionException, DuplicateListNameException {
        CustomList createdList = customListService.createList("Original Name", testUser);
        String newName = "Updated Name";

        CustomList updatedList = customListService.updateListName(createdList.getId(), testUser.getId(), newName);

        assertEquals(newName, updatedList.getName());

        CustomList retrievedList = customListDao.findById(createdList.getId()).orElseThrow();
        assertEquals(newName, retrievedList.getName());
    }

    @Test
    public void testUpdateNonExistentList() {
        assertThrows(InstanceNotFoundException.class, () -> {
            customListService.updateListName(NON_EXISTENT_ID, testUser.getId(), "New Name");
        });
    }

    @Test
    public void testUpdateListWithDuplicateName() throws DuplicateListNameException {
        customListService.createList("List 1", testUser);
        CustomList list2 = customListService.createList("List 2", testUser);
    
        assertThrows(DuplicateListNameException.class, () -> {
            customListService.updateListName(list2.getId(), testUser.getId(), "List 1");
        });
    }

    @Test
    public void testUpdateListWithWrongUser() throws DuplicateListNameException {
        CustomList createdList = customListService.createList("Original Name", testUser);
        
        assertThrows(PermissionException.class, () -> {
            customListService.updateListName(createdList.getId(), anotherUser.getId(), "New Name");
        });
    }

    @Test
    public void testDeleteList() throws InstanceNotFoundException, PermissionException, DuplicateListNameException {
        CustomList createdList = customListService.createList("List to Delete", testUser);

        customListService.deleteList(createdList.getId(), testUser.getId());

        assertFalse(customListDao.existsById(createdList.getId()));
    }

    @Test
    public void testDeleteNonExistentList() {
        assertThrows(InstanceNotFoundException.class, () -> {
            customListService.deleteList(NON_EXISTENT_ID, testUser.getId());
        });
    }

    @Test
    public void testDeleteListWithWrongUser() throws DuplicateListNameException {
        CustomList createdList = customListService.createList("List to Delete", testUser);
        
        assertThrows(PermissionException.class, () -> {
            customListService.deleteList(createdList.getId(), anotherUser.getId());
        });
    }

    @Test
    public void testAddMovieToList() throws InstanceNotFoundException, PermissionException, DuplicateListNameException, MovieAlreadyInListException {
        CustomList createdList = customListService.createList("Movie List", testUser);

        CustomList updatedList = customListService.addMovieToList(createdList.getId(), testUser.getId(), testMovie);

        assertEquals(1, updatedList.getMovies().size());
        assertEquals(testMovie.getId(), updatedList.getMovies().get(0).getId());

        CustomList retrievedList = customListDao.findById(createdList.getId()).orElseThrow();
        assertEquals(1, retrievedList.getMovies().size());
    }

    @Test
    public void testAddNewMovieToList() throws InstanceNotFoundException, PermissionException, DuplicateListNameException, MovieAlreadyInListException {
        CustomList createdList = customListService.createList("Movie List", testUser);
        Movie newMovie = createMovie("tt67890", "New Movie", "New Overview", 2024, "newposter.jpg", 110, 
                        List.of(), List.of(), List.of());

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
    public void testAddMovieAlreadyInList() throws InstanceNotFoundException, PermissionException, MovieAlreadyInListException, DuplicateListNameException {
        CustomList createdList = customListService.createList("Movie List", testUser);
        customListService.addMovieToList(createdList.getId(), testUser.getId(), testMovie);
    
        assertThrows(MovieAlreadyInListException.class, () -> {
            customListService.addMovieToList(createdList.getId(), testUser.getId(), testMovie);
        });
    }

    @Test
    public void testAddMovieToNonExistentList() {
        assertThrows(InstanceNotFoundException.class, () -> {
            customListService.addMovieToList(NON_EXISTENT_ID, testUser.getId(), testMovie);
        });
    }

    @Test
    public void testAddMovieToListWithWrongUser() throws DuplicateListNameException {
        CustomList createdList = customListService.createList("Movie List", testUser);
        
        assertThrows(PermissionException.class, () -> {
            customListService.addMovieToList(createdList.getId(), anotherUser.getId(), testMovie);
        });
    }

    @Test
    public void testRemoveMovieFromList() throws InstanceNotFoundException, PermissionException, DuplicateListNameException, MovieAlreadyInListException {
        CustomList createdList = customListService.createList("Movie List", testUser);
        customListService.addMovieToList(createdList.getId(), testUser.getId(), testMovie);

        CustomList updatedList = customListService.removeMovieFromList(createdList.getId(), testUser.getId(), testMovie.getId());

        assertTrue(updatedList.getMovies().isEmpty());

        CustomList retrievedList = customListDao.findById(createdList.getId()).orElseThrow();
        assertTrue(retrievedList.getMovies().isEmpty());
    }

    @Test
    public void testRemoveNonExistentMovieFromList() throws DuplicateListNameException {
        CustomList createdList = customListService.createList("Movie List", testUser);

        assertThrows(InstanceNotFoundException.class, () -> {
            customListService.removeMovieFromList(createdList.getId(), testUser.getId(), NON_EXISTENT_ID);
        });
    }

    @Test
    public void testRemoveMovieFromNonExistentList() {
        assertThrows(InstanceNotFoundException.class, () -> {
            customListService.removeMovieFromList(NON_EXISTENT_ID, testUser.getId(), testMovie.getId());
        });
    }

    @Test
    public void testRemoveMovieFromListWithWrongUser() throws InstanceNotFoundException, PermissionException, DuplicateListNameException, MovieAlreadyInListException {
        CustomList createdList = customListService.createList("Movie List", testUser);
        customListService.addMovieToList(createdList.getId(), testUser.getId(), testMovie);
        
        assertThrows(PermissionException.class, () -> {
            customListService.removeMovieFromList(createdList.getId(), anotherUser.getId(), testMovie.getId());
        });
    }
}