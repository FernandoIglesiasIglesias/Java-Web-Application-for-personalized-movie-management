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
        nonExistentDirector.setImdbId("non_existent_imdb_id");
    
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
        assertEquals("1.70 m", result.getHeight()); // No debe cambiar
        assertEquals("Steven Allan Spielberg (born December 18, 1946) is an American director, producer, and screenwriter.", result.getBio()); // No debe cambiar
    }
    
    @Test
    public void testUpdateDirectorWithNullName() {
        Director directorWithNullName = new Director();
        // No establecemos el nombre
        
        assertThrows(IllegalArgumentException.class, () -> {
            directorService.updateDirector(directorWithNullName);
        });
    }

    @Test
    public void testCreateDirectorWithNewImdbId() {
        // Crear un director con un imdbId único
        Director newDirector = new Director();
        newDirector.setName("Quentin Tarantino");
        newDirector.setImdbId("nm0000233");

        Director result = directorService.createDirector(newDirector);

        // Verificar que se creó un nuevo director
        assertNotNull(result);
        assertNotEquals(testDirector.getId(), result.getId());
        assertEquals("Quentin Tarantino", result.getName());
        assertEquals("nm0000233", result.getImdbId());
    }

    @Test
    public void testUpdateDirectorByImdbId() throws InstanceNotFoundException {
        // Crear una copia del director con datos actualizados
        Director updatedData = new Director();
        updatedData.setImdbId("nm0000229"); // Buscar por IMDB ID
        updatedData.setBio("Updated biography");
        updatedData.setHeight("1.75 m");

        Director result = directorService.updateDirector(updatedData);

        assertNotNull(result);
        assertEquals(testDirector.getId(), result.getId());
        assertEquals("Updated biography", result.getBio());
        assertEquals("1.75 m", result.getHeight());
    }

    @Test
    public void testUpdateDirectorByName() throws InstanceNotFoundException {
        // Crear una copia del director con datos actualizados
        Director updatedData = new Director();
        updatedData.setName("Steven Spielberg"); // Buscar por nombre
        updatedData.setBio("Updated biography");
        updatedData.setHeight("1.75 m");

        Director result = directorService.updateDirector(updatedData);

        assertNotNull(result);
        assertEquals(testDirector.getId(), result.getId());
        assertEquals("Updated biography", result.getBio());
        assertEquals("1.75 m", result.getHeight());
    }



    @Test
    public void testCreateDirectorWithExistingImdbId() {
        Director newDirector = new Director();
        newDirector.setName("Different Director Name");
        newDirector.setImdbId("nm0000229");
        newDirector.setBio("Updated biography");

        Director result = directorService.createDirector(newDirector);

        assertNotNull(result);
        assertEquals(testDirector.getId(), result.getId());
        assertEquals("Steven Spielberg", result.getName());
        assertEquals("nm0000229", result.getImdbId());
        assertEquals("Updated biography", result.getBio());
    }

    @Test
    public void testCreateDirectorWithExistingNameAndImdbId() {
        Director newDirector = new Director();
        newDirector.setName("Steven Spielberg");
        newDirector.setImdbId("nm0000229");
        newDirector.setBio("Updated biography");

        Director result = directorService.createDirector(newDirector);

        assertNotNull(result);
        assertEquals(testDirector.getId(), result.getId());
        assertEquals("Steven Spielberg", result.getName());
        assertEquals("nm0000229", result.getImdbId());
        assertEquals("Updated biography", result.getBio());
    }

    @Test
    public void testConcurrentDirectorCreation() {
        // Simular creaciones concurrentes del mismo director
        Director director1 = new Director();
        director1.setName("Christopher Nolan");
        director1.setImdbId("nm0634240");
        
        Director director2 = new Director();
        director2.setName("Christopher Nolan");
        director2.setImdbId("nm0634240");
        
        // Crear el primer director
        Director result1 = directorService.createDirector(director1);
        assertNotNull(result1);
        
        // Crear el segundo director con los mismos datos
        Director result2 = directorService.createDirector(director2);
        assertNotNull(result2);
        
        // Verificar que ambos resultados apuntan al mismo director en la base de datos
        assertEquals(result1.getId(), result2.getId());
    }

    @Test
    public void testUpdateExistingDirectorAllFields() throws InstanceNotFoundException {
        Director updatedData = new Director();
        updatedData.setImdbId("nm0000229"); // Use the existing IMDB ID to locate the director
        updatedData.setBirthDate(new java.sql.Date(System.currentTimeMillis()));
        updatedData.setBirthPlace("Los Angeles, California, USA");
        updatedData.setHeight("1.80 m");
        updatedData.setBio("Updated biography text");
        updatedData.setImageUrl("https://example.com/updated_image.jpg");

        Director result = directorService.updateDirector(updatedData);

        assertEquals(testDirector.getId(), result.getId());
        assertEquals("nm0000229", result.getImdbId());
        assertEquals("Los Angeles, California, USA", result.getBirthPlace());
        assertEquals("1.80 m", result.getHeight());
        assertEquals("Updated biography text", result.getBio());
        assertEquals("https://example.com/updated_image.jpg", result.getImageUrl());
    }

    @Test
    public void testUpdateExistingDirectorSomeFields() throws InstanceNotFoundException {
        Director updatedData = new Director();
        updatedData.setImdbId("nm0000229"); // Use the existing IMDB ID to locate the director
        updatedData.setHeight("1.75 m");

        Director result = directorService.updateDirector(updatedData);

        assertEquals(testDirector.getId(), result.getId());
        assertEquals("nm0000229", result.getImdbId());
        assertEquals("1.75 m", result.getHeight());
        assertEquals("Steven Allan Spielberg (born December 18, 1946) is an American director, producer, and screenwriter.", result.getBio());
    }

    @Test
    public void testUpdateExistingDirectorNoFields() throws InstanceNotFoundException {
        Director updatedData = new Director();
        updatedData.setImdbId("nm0000229"); // Use the existing IMDB ID to locate the director

        Director result = directorService.updateDirector(updatedData);

        assertEquals(testDirector.getId(), result.getId());
        assertEquals("nm0000229", result.getImdbId());
        assertEquals("Cincinnati, Ohio, USA", result.getBirthPlace());
        assertEquals("1.70 m", result.getHeight());
        assertEquals("Steven Allan Spielberg (born December 18, 1946) is an American director, producer, and screenwriter.", result.getBio());
    }

    @Test
    public void testCreateDirectorNew() {
        Director newDirector = new Director();
        newDirector.setName("Quentin Tarantino");
        newDirector.setImdbId("nm0000233");
        newDirector.setBio("New biography text");

        Director result = directorService.createDirector(newDirector);

        assertNotNull(result);
        assertNotEquals(testDirector.getId(), result.getId());
        assertEquals("Quentin Tarantino", result.getName());
        assertEquals("nm0000233", result.getImdbId());
        assertEquals("New biography text", result.getBio());
    }

    @Test
    public void testCreateDirectorWithExistingName() {
        // Intentar crear un director con el mismo nombre que el director de prueba
        Director newDirector = new Director();
        newDirector.setName("Steven Spielberg"); // Mismo nombre que testDirector
        newDirector.setImdbId("nm9999999"); // ImdbId diferente

        Director result = directorService.createDirector(newDirector);

        // Verificar que no se creó un nuevo director, sino que se devolvió el existente
        assertNotNull(result);
        assertEquals(testDirector.getId(), result.getId());
        assertEquals("Steven Spielberg", result.getName());
        
        // Verificar que se actualizó el imdbId del director existente
        assertEquals("nm9999999", result.getImdbId());
    }

    @Test
    public void testCreateDirectorWithExistingImdbIdButNoName() {
        Director newDirector = new Director();
        newDirector.setName("Steven Spielberg"); // Provide a valid name
        newDirector.setImdbId("nm0000229"); // `imdbId` existente
        newDirector.setBio("Updated biography"); // Nuevo campo

        Director result = directorService.createDirector(newDirector);

        assertNotNull(result);
        assertEquals(testDirector.getId(), result.getId());
        assertEquals("Steven Spielberg", result.getName()); // Nombre no debe cambiar
        assertEquals("Updated biography", result.getBio()); // Bio debe actualizarse
    }

    @Test
    public void testCreateDirectorWithExistingNameButNoImdbId() {
        Director newDirector = new Director();
        newDirector.setName("Steven Spielberg"); // Nombre existente
        newDirector.setBio("Updated biography"); // Nuevo campo

        Director result = directorService.createDirector(newDirector);

        assertNotNull(result);
        assertEquals(testDirector.getId(), result.getId());
        assertEquals("nm0000229", result.getImdbId()); // `imdbId` no debe cambiar
        assertEquals("Updated biography", result.getBio()); // Bio debe actualizarse
    }

    @Test
    public void testCreateDirectorWithNonExistentImdbIdAndName() {
        Director newDirector = new Director();
        newDirector.setName("Quentin Tarantino"); // Nombre nuevo
        newDirector.setImdbId("nm0000233"); // `imdbId` nuevo

        Director result = directorService.createDirector(newDirector);

        assertNotNull(result);
        assertNotEquals(testDirector.getId(), result.getId());
        assertEquals("Quentin Tarantino", result.getName());
        assertEquals("nm0000233", result.getImdbId());
    }

    @Test
    public void testCreateDirectorWithExistingImdbIdAndName() {
        Director newDirector = new Director();
        newDirector.setName("Steven Spielberg"); // Nombre existente
        newDirector.setImdbId("nm0000229"); // `imdbId` existente
        newDirector.setBio("Updated biography"); // Nuevo campo

        Director result = directorService.createDirector(newDirector);

        assertNotNull(result);
        assertEquals(testDirector.getId(), result.getId());
        assertEquals("Steven Spielberg", result.getName()); // Nombre no debe cambiar
        assertEquals("nm0000229", result.getImdbId()); // `imdbId` no debe cambiar
        assertEquals("Updated biography", result.getBio()); // Bio debe actualizarse
    }

    @Test
    public void testCreateDirectorWithoutImdbIdOrName() {
        Director newDirector = new Director();
        newDirector.setBio("Updated biography"); // Campo adicional

        assertThrows(IllegalArgumentException.class, () -> {
            directorService.createDirector(newDirector);
        });
    }

}