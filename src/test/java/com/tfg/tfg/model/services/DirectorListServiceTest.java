package com.tfg.tfg.model.services;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.tfg.tfg.model.entities.Director;
import com.tfg.tfg.model.entities.DirectorDao;
import com.tfg.tfg.model.entities.DirectorList;
import com.tfg.tfg.model.entities.DirectorListDao;
import com.tfg.tfg.model.entities.Users;
import com.tfg.tfg.model.entities.UsersDao;
import com.tfg.tfg.model.services.exceptions.DuplicateListNameException;
import com.tfg.tfg.model.services.exceptions.EmptyUserListsException;
import com.tfg.tfg.model.services.exceptions.InstanceNotFoundException;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
public class DirectorListServiceTest {

    private final Long NON_EXISTENT_ID = -1L;
    
    @Autowired
    private DirectorListService directorListService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private DirectorDao directorDao;
    
    @Autowired
    private UsersDao usersDao;
    
    @Autowired
    private DirectorListDao directorListDao;
    
    private Users testUser;
    private Users anotherUser;
    private Director testDirector;
    
    @BeforeEach
    public void setUp() throws Exception {
        // Create test user
        testUser = new Users("testUser", "password", "test@example.com", "avatar.jpg");
        userService.signUp(testUser);
        
        // Create another user for permission tests
        anotherUser = new Users("anotherUser", "password", "another@example.com", "avatar2.jpg");
        usersDao.save(anotherUser);
        
        // Create test director
        testDirector = new Director();
        testDirector.setFirstName("Christopher");
        testDirector.setLastName("Nolan");
        testDirector = directorDao.save(testDirector);
    }
    
    @Test
    public void testCreateDirectorList() throws InstanceNotFoundException, DuplicateListNameException {
        DirectorList createdList = directorListService.createDirectorList(testUser.getId(), "Test Director List");
        
        assertNotNull(createdList);
        assertNotNull(createdList.getId());
        assertEquals("Test Director List", createdList.getName());
        assertEquals(testUser.getId(), createdList.getUser().getId());
        assertTrue(directorListDao.existsById(createdList.getId()));
    }
    
    @Test
    public void testCreateDuplicateDirectorList() throws InstanceNotFoundException, DuplicateListNameException {
        directorListService.createDirectorList(testUser.getId(), "Duplicate List");
        
        assertThrows(DuplicateListNameException.class, () -> {
            directorListService.createDirectorList(testUser.getId(), "Duplicate List");
        });
    }
    
    @Test
    public void testCreateDirectorListNonExistentUser() {
        assertThrows(InstanceNotFoundException.class, () -> {
            directorListService.createDirectorList(NON_EXISTENT_ID, "Test List");
        });
    }
    
    @Test
    public void testGetUserDirectorLists() throws InstanceNotFoundException, DuplicateListNameException, EmptyUserListsException {
        DirectorList list1 = directorListService.createDirectorList(testUser.getId(), "List 1");
        DirectorList list2 = directorListService.createDirectorList(testUser.getId(), "List 2");
        directorListService.createDirectorList(anotherUser.getId(), "Another List");
        
        List<DirectorList> userLists = directorListService.getUserDirectorLists(testUser.getId());
        
        assertEquals(3, userLists.size());
        assertTrue(userLists.stream().anyMatch(list -> list.getId().equals(list1.getId())));
        assertTrue(userLists.stream().anyMatch(list -> list.getId().equals(list2.getId())));
        assertTrue(userLists.stream().anyMatch(list -> "Directores favoritos".equals(list.getName())));
    }
    
    @Test
    public void testGetUserDirectorListsNonExistentUser() {
        assertThrows(InstanceNotFoundException.class, () -> {
            directorListService.getUserDirectorLists(NON_EXISTENT_ID);
        });
    }
    
    @Test
    public void testGetUserDirectorListsEmptyLists() throws InstanceNotFoundException {
        // Create a user without using signUp to avoid default list creation
        Users emptyUser = new Users("emptyUser", "password", "empty@example.com", "avatar.jpg");
        usersDao.save(emptyUser);
        
        // This user doesn't have the default lists, so should throw EmptyUserListsException
        assertThrows(EmptyUserListsException.class, () -> {
            directorListService.getUserDirectorLists(emptyUser.getId());
        });
    }
    
    @Test
    public void testGetDirectorListById() throws InstanceNotFoundException, DuplicateListNameException {
        DirectorList createdList = directorListService.createDirectorList(testUser.getId(), "Test List");
        
        DirectorList retrievedList = directorListService.getDirectorListById(createdList.getId());
        
        assertEquals(createdList.getId(), retrievedList.getId());
        assertEquals("Test List", retrievedList.getName());
        assertEquals(testUser.getId(), retrievedList.getUser().getId());
    }
    
    @Test
    public void testGetNonExistentDirectorList() {
        assertThrows(InstanceNotFoundException.class, () -> {
            directorListService.getDirectorListById(NON_EXISTENT_ID);
        });
    }
    
    @Test
    public void testUpdateDirectorListName() throws InstanceNotFoundException, DuplicateListNameException {
        DirectorList createdList = directorListService.createDirectorList(testUser.getId(), "Original Name");
        
        DirectorList updatedList = directorListService.updateDirectorListName(createdList.getId(), "Updated Name");
        
        assertEquals(createdList.getId(), updatedList.getId());
        assertEquals("Updated Name", updatedList.getName());
    }
    
    @Test
    public void testUpdateDirectorListWithSameName() throws InstanceNotFoundException, DuplicateListNameException {
        DirectorList createdList = directorListService.createDirectorList(testUser.getId(), "Same Name");
        
        DirectorList updatedList = directorListService.updateDirectorListName(createdList.getId(), "Same Name");
        
        assertEquals(createdList.getId(), updatedList.getId());
        assertEquals("Same Name", updatedList.getName());
    }
    
    @Test
    public void testUpdateDirectorListWithDuplicateName() throws InstanceNotFoundException, DuplicateListNameException {
        directorListService.createDirectorList(testUser.getId(), "Existing Name");
        DirectorList listToUpdate = directorListService.createDirectorList(testUser.getId(), "To Update");
        
        assertThrows(DuplicateListNameException.class, () -> {
            directorListService.updateDirectorListName(listToUpdate.getId(), "Existing Name");
        });
    }
    
    @Test
    public void testUpdateNonExistentDirectorList() {
        assertThrows(InstanceNotFoundException.class, () -> {
            directorListService.updateDirectorListName(NON_EXISTENT_ID, "New Name");
        });
    }
    
    @Test
    public void testDeleteDirectorList() throws InstanceNotFoundException, DuplicateListNameException {
        DirectorList createdList = directorListService.createDirectorList(testUser.getId(), "List to Delete");
        
        directorListService.deleteDirectorList(createdList.getId());
        
        assertFalse(directorListDao.existsById(createdList.getId()));
    }
    
    @Test
    public void testDeleteNonExistentDirectorList() {
        assertThrows(InstanceNotFoundException.class, () -> {
            directorListService.deleteDirectorList(NON_EXISTENT_ID);
        });
    }
    
    @Test
    public void testAddDirectorToList() throws InstanceNotFoundException, DuplicateListNameException {
        DirectorList createdList = directorListService.createDirectorList(testUser.getId(), "Director List");
        
        DirectorList updatedList = directorListService.addDirectorToList(createdList.getId(), testDirector.getId());
        
        assertEquals(1, updatedList.getDirectors().size());
        assertEquals(testDirector.getId(), updatedList.getDirectors().get(0).getId());
    }
    
    @Test
    public void testAddDirectorToNonExistentList() {
        assertThrows(InstanceNotFoundException.class, () -> {
            directorListService.addDirectorToList(NON_EXISTENT_ID, testDirector.getId());
        });
    }
    
    @Test
    public void testAddNonExistentDirectorToList() throws InstanceNotFoundException, DuplicateListNameException {
        DirectorList createdList = directorListService.createDirectorList(testUser.getId(), "Director List");
        
        assertThrows(InstanceNotFoundException.class, () -> {
            directorListService.addDirectorToList(createdList.getId(), NON_EXISTENT_ID);
        });
    }
    
    @Test
    public void testRemoveDirectorFromList() throws InstanceNotFoundException, DuplicateListNameException {
        DirectorList createdList = directorListService.createDirectorList(testUser.getId(), "Director List");
        DirectorList listWithDirector = directorListService.addDirectorToList(createdList.getId(), testDirector.getId());
        
        assertEquals(1, listWithDirector.getDirectors().size());
        
        DirectorList updatedList = directorListService.removeDirectorFromList(createdList.getId(), testDirector.getId());
        
        assertEquals(0, updatedList.getDirectors().size());
    }
    
    @Test
    public void testRemoveDirectorFromNonExistentList() {
        assertThrows(InstanceNotFoundException.class, () -> {
            directorListService.removeDirectorFromList(NON_EXISTENT_ID, testDirector.getId());
        });
    }
    
    @Test
    public void testRemoveNonExistentDirectorFromList() throws InstanceNotFoundException, DuplicateListNameException {
        DirectorList createdList = directorListService.createDirectorList(testUser.getId(), "Director List");
        
        assertThrows(InstanceNotFoundException.class, () -> {
            directorListService.removeDirectorFromList(createdList.getId(), NON_EXISTENT_ID);
        });
    }
}   