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
import com.tfg.tfg.model.services.exceptions.InstanceNotFoundException;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
public class DirectorServiceTest {

    private final Long NON_EXISTENT_ID = -1L;
    
    @Autowired
    private DirectorService directorService;
    
    @Autowired
    private DirectorDao directorDao;
    
    private Director testDirector;
    
    @BeforeEach
    public void setUp() {
        directorDao.deleteAll();
        
        testDirector = new Director();
        testDirector.setName("Steven Spielberg");
        testDirector.setImdbId("nm0000229");
        testDirector.setBirthDate(new java.sql.Date(System.currentTimeMillis())); // Fecha actual como ejemplo
        testDirector.setBirthPlace("Cincinnati, Ohio, USA");
        testDirector.setStarSign("Sagittarius");
        testDirector.setHeight("1.70 m");
        testDirector.setBio("Steven Allan Spielberg (born December 18, 1946) is an American director, producer, and screenwriter.");
        testDirector.setImageUrl("https://example.com/steven_spielberg.jpg");
        
        testDirector = directorDao.save(testDirector);
    }
    
    @Test
    public void testFindById() throws InstanceNotFoundException {
        Director director = directorService.findById(testDirector.getId());
        
        assertNotNull(director);
        assertEquals(testDirector.getId(), director.getId());
        assertEquals("Steven Spielberg", director.getName());
        assertEquals("nm0000229", director.getImdbId());
    }
    
    @Test
    public void testFindByIdNotFound() {
        assertThrows(InstanceNotFoundException.class, () -> {
            directorService.findById(NON_EXISTENT_ID);
        });
    }
    
    @Test
    public void testFindByName() throws InstanceNotFoundException {
        Director director = directorService.findByName("Steven Spielberg");
        
        assertNotNull(director);
        assertEquals(testDirector.getId(), director.getId());
        assertEquals("nm0000229", director.getImdbId());
    }
    
    @Test
    public void testFindByNameNotFound() {
        assertThrows(InstanceNotFoundException.class, () -> {
            directorService.findByName("Non Existent");
        });
    }
    
    @Test
    public void testFindByImdbId() throws InstanceNotFoundException {
        Director director = directorService.findByImdbId("nm0000229");
        
        assertNotNull(director);
        assertEquals(testDirector.getId(), director.getId());
        assertEquals("Steven Spielberg", director.getName());
    }
    
    @Test
    public void testFindByImdbIdNotFound() {
        assertThrows(InstanceNotFoundException.class, () -> {
            directorService.findByImdbId("non_existent_imdb_id");
        });
    }
    
    @Test
    public void testGetAllDirectors() {
        Director secondDirector = new Director();
        secondDirector.setName("Christopher Nolan");
        secondDirector.setImdbId("nm0634240");
        directorDao.save(secondDirector);
        
        List<Director> directors = directorService.getAllDirectors();
        
        assertEquals(2, directors.size());
        assertTrue(directors.stream().anyMatch(d -> d.getImdbId().equals("nm0000229")));
        assertTrue(directors.stream().anyMatch(d -> d.getImdbId().equals("nm0634240")));
    }
    
    @Test
    public void testUpdateDirector() throws InstanceNotFoundException {
        Director updatedData = new Director();
        updatedData.setName("Steven Spielberg");
        updatedData.setImdbId("nm0000230"); 
        updatedData.setBio("New biography text"); 
        updatedData.setHeight("1.71 m");
        
        Director result = directorService.updateDirector(updatedData);
        
        assertNotNull(result);
        assertEquals(testDirector.getId(), result.getId());
        assertEquals("Steven Spielberg", result.getName());
        assertEquals("nm0000230", result.getImdbId()); // Debe actualizarse
        assertEquals("1.71 m", result.getHeight()); // Debe actualizarse
        assertEquals("New biography text", result.getBio()); // Debe actualizarse
    }
    
    @Test
    public void testUpdateDirectorNotFound() {
        Director nonExistentDirector = new Director();
        nonExistentDirector.setName("Non Existent");
        
        assertThrows(InstanceNotFoundException.class, () -> {
            directorService.updateDirector(nonExistentDirector);
        });
    }
    
    @Test
    public void testUpdateNonExistingFields() throws InstanceNotFoundException {
        testDirector.setBio(null);
        testDirector.setHeight(null);
        testDirector = directorDao.save(testDirector);
        
        Director updatedData = new Director();
        updatedData.setName("Steven Spielberg");
        updatedData.setHeight("1.71 m");
        updatedData.setBio("New biography text");
        
        Director result = directorService.updateDirector(updatedData);
        
        assertEquals(testDirector.getId(), result.getId());
        assertEquals("1.71 m", result.getHeight());
        assertEquals("New biography text", result.getBio());
    }
    
    @Test
    public void testUpdateDirectorWithEmptyFields() throws InstanceNotFoundException {
        // Crear un director con algunos campos vacíos
        Director updatedData = new Director();
        updatedData.setName("Steven Spielberg");
        updatedData.setHeight(""); 
        updatedData.setBio("");

        Director result = directorService.updateDirector(updatedData);
        
        assertEquals(testDirector.getId(), result.getId());
        assertEquals("1.70 m", result.getHeight()); 
        assertEquals("Steven Allan Spielberg (born December 18, 1946) is an American director, producer, and screenwriter.", result.getBio());
    }
    
    @Test
    public void testUpdateDirectorWithNullName() {
        Director directorWithNullName = new Director();
        // No establecemos el nombre
        
        assertThrows(IllegalArgumentException.class, () -> {
            directorService.updateDirector(directorWithNullName);
        });
    }
}