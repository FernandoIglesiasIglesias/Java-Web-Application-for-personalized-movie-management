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
import com.tfg.tfg.model.entities.ActorDao;
import com.tfg.tfg.model.entities.ActorList;
import com.tfg.tfg.model.entities.ActorListDao;
import com.tfg.tfg.model.entities.Users;
import com.tfg.tfg.model.entities.UsersDao;
import com.tfg.tfg.model.services.exceptions.DuplicateListNameException;
import com.tfg.tfg.model.services.exceptions.EmptyUserListsException;
import com.tfg.tfg.model.services.exceptions.InstanceNotFoundException;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
public class ActorListServiceTest {

    private final Long NON_EXISTENT_ID = -1L;
    
    @Autowired
    private ActorListService actorListService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private ActorDao actorDao;
    
    @Autowired
    private UsersDao usersDao;
    
    @Autowired
    private ActorListDao actorListDao;
    
    private Users testUser;
    private Users anotherUser;
    private Actor testActor;
    
    @BeforeEach
    public void setUp() throws Exception {
        // Create test user
        testUser = new Users("testUser", "password", "test@example.com", "avatar.jpg");
        userService.signUp(testUser);
        
        // Create another user for permission tests
        anotherUser = new Users("anotherUser", "password", "another@example.com", "avatar2.jpg");
        usersDao.save(anotherUser);
        
        // Create test actor
        testActor = new Actor();
        testActor.setName("Robert Downey Jr.");
        testActor.setImdbId("nm0000375");
        testActor = actorDao.save(testActor);
    }
    
    @Test
    public void testCreateActorList() throws InstanceNotFoundException, DuplicateListNameException {
        ActorList createdList = actorListService.createActorList(testUser.getId(), "Test Actor List");
        
        assertNotNull(createdList);
        assertNotNull(createdList.getId());
        assertEquals("Test Actor List", createdList.getName());
        assertEquals(testUser.getId(), createdList.getUser().getId());
        assertTrue(actorListDao.existsById(createdList.getId()));
    }
    
    @Test
    public void testCreateDuplicateActorList() throws InstanceNotFoundException, DuplicateListNameException {
        actorListService.createActorList(testUser.getId(), "Duplicate List");
        
        assertThrows(DuplicateListNameException.class, () -> {
            actorListService.createActorList(testUser.getId(), "Duplicate List");
        });
    }
    
    @Test
    public void testCreateActorListNonExistentUser() {
        assertThrows(InstanceNotFoundException.class, () -> {
            actorListService.createActorList(NON_EXISTENT_ID, "Test List");
        });
    }
    
    @Test
    public void testGetUserActorLists() throws InstanceNotFoundException, DuplicateListNameException, EmptyUserListsException {
        ActorList list1 = actorListService.createActorList(testUser.getId(), "List 1");
        ActorList list2 = actorListService.createActorList(testUser.getId(), "List 2");
        actorListService.createActorList(anotherUser.getId(), "Another List");
        
        List<ActorList> userLists = actorListService.getUserActorLists(testUser.getId());
        
        assertEquals(3, userLists.size());
        assertTrue(userLists.stream().anyMatch(list -> list.getId().equals(list1.getId())));
        assertTrue(userLists.stream().anyMatch(list -> list.getId().equals(list2.getId())));
        assertTrue(userLists.stream().anyMatch(list -> "Actores favoritos".equals(list.getName())));
    }
    
    @Test
    public void testGetUserActorListsNonExistentUser() {
        assertThrows(InstanceNotFoundException.class, () -> {
            actorListService.getUserActorLists(NON_EXISTENT_ID);
        });
    }
    
    @Test
    public void testGetUserActorListsEmptyLists() throws InstanceNotFoundException {
        // Create a user without using signUp to avoid default list creation
        Users emptyUser = new Users("emptyUser", "password", "empty@example.com", "avatar.jpg");
        usersDao.save(emptyUser);
        
        // This user doesn't have the default lists, so should throw EmptyUserListsException
        assertThrows(EmptyUserListsException.class, () -> {
            actorListService.getUserActorLists(emptyUser.getId());
        });
    }
    
    @Test
    public void testGetActorListById() throws InstanceNotFoundException, DuplicateListNameException {
        ActorList createdList = actorListService.createActorList(testUser.getId(), "Test List");
        
        ActorList retrievedList = actorListService.getActorListById(createdList.getId());
        
        assertEquals(createdList.getId(), retrievedList.getId());
        assertEquals("Test List", retrievedList.getName());
        assertEquals(testUser.getId(), retrievedList.getUser().getId());
    }
    
    @Test
    public void testGetNonExistentActorList() {
        assertThrows(InstanceNotFoundException.class, () -> {
            actorListService.getActorListById(NON_EXISTENT_ID);
        });
    }
    
    @Test
    public void testUpdateActorListName() throws InstanceNotFoundException, DuplicateListNameException {
        ActorList createdList = actorListService.createActorList(testUser.getId(), "Original Name");
        
        ActorList updatedList = actorListService.updateActorListName(createdList.getId(), "Updated Name");
        
        assertEquals(createdList.getId(), updatedList.getId());
        assertEquals("Updated Name", updatedList.getName());
    }
    
    @Test
    public void testUpdateActorListWithSameName() throws InstanceNotFoundException, DuplicateListNameException {
        ActorList createdList = actorListService.createActorList(testUser.getId(), "Same Name");
        
        ActorList updatedList = actorListService.updateActorListName(createdList.getId(), "Same Name");
        
        assertEquals(createdList.getId(), updatedList.getId());
        assertEquals("Same Name", updatedList.getName());
    }
    
    @Test
    public void testUpdateActorListWithDuplicateName() throws InstanceNotFoundException, DuplicateListNameException {
        actorListService.createActorList(testUser.getId(), "Existing Name");
        ActorList listToUpdate = actorListService.createActorList(testUser.getId(), "To Update");
        
        assertThrows(DuplicateListNameException.class, () -> {
            actorListService.updateActorListName(listToUpdate.getId(), "Existing Name");
        });
    }
    
    @Test
    public void testUpdateNonExistentActorList() {
        assertThrows(InstanceNotFoundException.class, () -> {
            actorListService.updateActorListName(NON_EXISTENT_ID, "New Name");
        });
    }
    
    @Test
    public void testDeleteActorList() throws InstanceNotFoundException, DuplicateListNameException {
        ActorList createdList = actorListService.createActorList(testUser.getId(), "List to Delete");
        
        actorListService.deleteActorList(createdList.getId());
        
        assertFalse(actorListDao.existsById(createdList.getId()));
    }
    
    @Test
    public void testDeleteNonExistentActorList() {
        assertThrows(InstanceNotFoundException.class, () -> {
            actorListService.deleteActorList(NON_EXISTENT_ID);
        });
    }
    
    @Test
    public void testAddActorToList() throws InstanceNotFoundException, DuplicateListNameException {
        ActorList createdList = actorListService.createActorList(testUser.getId(), "Actor List");
        
        ActorList updatedList = actorListService.addActorToList(createdList.getId(), testActor.getId());
        
        assertEquals(1, updatedList.getActors().size());
        assertEquals(testActor.getId(), updatedList.getActors().get(0).getId());
    }
    
    @Test
    public void testAddActorToNonExistentList() {
        assertThrows(InstanceNotFoundException.class, () -> {
            actorListService.addActorToList(NON_EXISTENT_ID, testActor.getId());
        });
    }
    
    @Test
    public void testAddNonExistentActorToList() throws InstanceNotFoundException, DuplicateListNameException {
        ActorList createdList = actorListService.createActorList(testUser.getId(), "Actor List");
        
        assertThrows(InstanceNotFoundException.class, () -> {
            actorListService.addActorToList(createdList.getId(), NON_EXISTENT_ID);
        });
    }
    
    @Test
    public void testRemoveActorFromList() throws InstanceNotFoundException, DuplicateListNameException {
        ActorList createdList = actorListService.createActorList(testUser.getId(), "Actor List");
        ActorList listWithActor = actorListService.addActorToList(createdList.getId(), testActor.getId());
        
        assertEquals(1, listWithActor.getActors().size());
        
        ActorList updatedList = actorListService.removeActorFromList(createdList.getId(), testActor.getId());
        
        assertEquals(0, updatedList.getActors().size());
    }
    
    @Test
    public void testRemoveActorFromNonExistentList() {
        assertThrows(InstanceNotFoundException.class, () -> {
            actorListService.removeActorFromList(NON_EXISTENT_ID, testActor.getId());
        });
    }
    
    @Test
    public void testRemoveNonExistentActorFromList() throws InstanceNotFoundException, DuplicateListNameException {
        ActorList createdList = actorListService.createActorList(testUser.getId(), "Actor List");
        
        assertThrows(InstanceNotFoundException.class, () -> {
            actorListService.removeActorFromList(createdList.getId(), NON_EXISTENT_ID);
        });
    }
}