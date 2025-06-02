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
import com.tfg.tfg.model.services.exceptions.InstanceNotFoundException;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
public class ActorServiceTest {

    private final Long NON_EXISTENT_ID = -1L;
    
    @Autowired
    private ActorService actorService;
    
    @Autowired
    private ActorDao actorDao;
    
    private Actor testActor;
    
    @BeforeEach
    public void setUp() {
        // Limpiamos la base de datos antes de cada test
        actorDao.deleteAll();
        
        // Creamos un actor de prueba
        testActor = new Actor();
        testActor.setName("Robert Downey Jr.");
        testActor.setImdbId("nm0000375");
        testActor.setBirthDate(new java.sql.Date(System.currentTimeMillis())); // Fecha actual como ejemplo
        testActor.setBirthPlace("New York City, New York, USA");
        testActor.setHeight("1.74 m");
        testActor.setBio("Robert John Downey Jr. (born April 4, 1965) is an American actor and producer.");
        testActor.setImageUrl("https://example.com/robert_downey_jr.jpg");
        
        // Guardamos el actor en la base de datos
        testActor = actorDao.save(testActor);
    }
    
    @Test
    public void testFindById() throws InstanceNotFoundException {
        Actor actor = actorService.findById(testActor.getId());
        
        assertNotNull(actor);
        assertEquals(testActor.getId(), actor.getId());
        assertEquals("Robert Downey Jr.", actor.getName());
        assertEquals("nm0000375", actor.getImdbId());
    }
    
    @Test
    public void testFindByIdNotFound() {
        assertThrows(InstanceNotFoundException.class, () -> {
            actorService.findById(NON_EXISTENT_ID);
        });
    }
    
    @Test
    public void testFindByName() throws InstanceNotFoundException {
        Actor actor = actorService.findByName("Robert Downey Jr.");
        
        assertNotNull(actor);
        assertEquals(testActor.getId(), actor.getId());
        assertEquals("nm0000375", actor.getImdbId());
    }
    
    @Test
    public void testFindByNameNotFound() {
        assertThrows(InstanceNotFoundException.class, () -> {
            actorService.findByName("Non Existent");
        });
    }
    
    @Test
    public void testFindByImdbId() throws InstanceNotFoundException {
        Actor actor = actorService.findByImdbId("nm0000375");
        
        assertNotNull(actor);
        assertEquals(testActor.getId(), actor.getId());
        assertEquals("Robert Downey Jr.", actor.getName());
    }
    
    @Test
    public void testFindByImdbIdNotFound() {
        assertThrows(InstanceNotFoundException.class, () -> {
            actorService.findByImdbId("non_existent_imdb_id");
        });
    }
    
    @Test
    public void testGetAllActors() {
        // Agregar otro actor para la prueba
        Actor secondActor = new Actor();
        secondActor.setName("Chris Evans");
        secondActor.setImdbId("nm0262635");
        actorDao.save(secondActor);
        
        List<Actor> actors = actorService.getAllActors();
        
        assertEquals(2, actors.size());
        assertTrue(actors.stream().anyMatch(a -> a.getImdbId().equals("nm0000375")));
        assertTrue(actors.stream().anyMatch(a -> a.getImdbId().equals("nm0262635")));
    }
    
    @Test
    public void testUpdateActor() throws InstanceNotFoundException {
        // Crear una copia del actor con datos actualizados
        Actor updatedData = new Actor();
        updatedData.setName("Robert Downey Jr.");  // Necesario para encontrar el actor
        updatedData.setImdbId("nm0000376"); // Actualizar el IMDB ID
        updatedData.setBio("New biography text"); // Actualizar la biografía
        updatedData.setHeight("1.75 m"); // Actualizar la altura
        
        Actor result = actorService.updateActor(updatedData);
        
        assertNotNull(result);
        assertEquals(testActor.getId(), result.getId());
        assertEquals("Robert Downey Jr.", result.getName());
        assertEquals("nm0000376", result.getImdbId()); // Debe actualizarse
        assertEquals("1.75 m", result.getHeight()); // Debe actualizarse
        assertEquals("New biography text", result.getBio()); // Debe actualizarse
    }
    
    @Test
    public void testUpdateActorNotFound() {
        Actor nonExistentActor = new Actor();
        nonExistentActor.setImdbId("non_existent_imdb_id");
    
        assertThrows(InstanceNotFoundException.class, () -> {
            actorService.updateActor(nonExistentActor);
        });
    }
    
    @Test
    public void testUpdateNonExistingFields() throws InstanceNotFoundException {
        // Eliminamos algunos campos del actor de prueba
        testActor.setBio(null);
        testActor.setHeight(null);
        testActor = actorDao.save(testActor);
        
        // Crear un actor con datos a actualizar
        Actor updatedData = new Actor();
        updatedData.setName("Robert Downey Jr.");  // Necesario para encontrar el actor
        updatedData.setHeight("1.75 m"); // Nuevo valor para campo vacío
        updatedData.setBio("New biography text"); // Nuevo valor para campo vacío
        
        Actor result = actorService.updateActor(updatedData);
        
        assertEquals(testActor.getId(), result.getId());
        assertEquals("1.75 m", result.getHeight()); // Debe actualizarse
        assertEquals("New biography text", result.getBio()); // Debe actualizarse
    }
    
    @Test
    public void testUpdateActorWithEmptyFields() throws InstanceNotFoundException {
        // Crear un actor con algunos campos vacíos
        Actor updatedData = new Actor();
        updatedData.setName("Robert Downey Jr.");  // Necesario para encontrar el actor
        updatedData.setHeight(""); // Campo vacío
        updatedData.setBio(""); // Campo vacío
        
        Actor result = actorService.updateActor(updatedData);
        
        assertEquals(testActor.getId(), result.getId());
        assertEquals("1.74 m", result.getHeight()); // No debe cambiar
        assertEquals("Robert John Downey Jr. (born April 4, 1965) is an American actor and producer.", result.getBio()); // No debe cambiar
    }
    
    @Test
    public void testUpdateActorWithNullName() {
        Actor actorWithNullName = new Actor();
        // No establecemos el nombre
        
        assertThrows(IllegalArgumentException.class, () -> {
            actorService.updateActor(actorWithNullName);
        });
    }

    @Test
    public void testCreateActorWithNewImdbId() {
        // Crear un actor con un imdbId único
        Actor newActor = new Actor();
        newActor.setName("Chris Hemsworth");
        newActor.setImdbId("nm1165110");

        Actor result = actorService.createActor(newActor);

        // Verificar que se creó un nuevo actor
        assertNotNull(result);
        assertNotEquals(testActor.getId(), result.getId());
        assertEquals("Chris Hemsworth", result.getName());
        assertEquals("nm1165110", result.getImdbId());
    }

    @Test
    public void testUpdateActorByImdbId() throws InstanceNotFoundException {
        // Crear una copia del actor con datos actualizados
        Actor updatedData = new Actor();
        updatedData.setImdbId("nm0000375"); // Buscar por IMDB ID
        updatedData.setBio("Updated biography");
        updatedData.setHeight("1.80 m");

        Actor result = actorService.updateActor(updatedData);

        assertNotNull(result);
        assertEquals(testActor.getId(), result.getId());
        assertEquals("Updated biography", result.getBio());
        assertEquals("1.80 m", result.getHeight());
    }

    @Test
    public void testUpdateActorByName() throws InstanceNotFoundException {
        // Crear una copia del actor con datos actualizados
        Actor updatedData = new Actor();
        updatedData.setName("Robert Downey Jr."); // Buscar por nombre
        updatedData.setBio("Updated biography");
        updatedData.setHeight("1.80 m");

        Actor result = actorService.updateActor(updatedData);

        assertNotNull(result);
        assertEquals(testActor.getId(), result.getId());
        assertEquals("Updated biography", result.getBio());
        assertEquals("1.80 m", result.getHeight());
    }

    @Test
    public void testCreateActorWithExistingName() {
        Actor newActor = new Actor();
        newActor.setName("Robert Downey Jr.");
        newActor.setImdbId("nm9999999");
        newActor.setBio("Updated biography");

        Actor result = actorService.createActor(newActor);

        assertNotNull(result);
        assertEquals(testActor.getId(), result.getId());
        assertEquals("Robert Downey Jr.", result.getName());
        assertEquals("nm9999999", result.getImdbId());
        assertEquals("Updated biography", result.getBio());
    }

    @Test
    public void testCreateActorWithExistingImdbId() {
        Actor newActor = new Actor();
        newActor.setName("Different Actor Name");
        newActor.setImdbId("nm0000375");
        newActor.setBio("Updated biography");

        Actor result = actorService.createActor(newActor);

        assertNotNull(result);
        assertEquals(testActor.getId(), result.getId());
        assertEquals("Robert Downey Jr.", result.getName());
        assertEquals("nm0000375", result.getImdbId());
        assertEquals("Updated biography", result.getBio());
    }

    @Test
    public void testCreateActorWithExistingNameAndImdbId() {
        Actor newActor = new Actor();
        newActor.setName("Robert Downey Jr.");
        newActor.setImdbId("nm0000375");
        newActor.setBio("Updated biography");

        Actor result = actorService.createActor(newActor);

        assertNotNull(result);
        assertEquals(testActor.getId(), result.getId());
        assertEquals("Robert Downey Jr.", result.getName());
        assertEquals("nm0000375", result.getImdbId());
        assertEquals("Updated biography", result.getBio());
    }

    @Test
    public void testConcurrentActorCreation() {
        // Simular creaciones concurrentes del mismo actor
        Actor actor1 = new Actor();
        actor1.setName("Tom Hanks");
        actor1.setImdbId("nm0000158");
        
        Actor actor2 = new Actor();
        actor2.setName("Tom Hanks");
        actor2.setImdbId("nm0000158");
        
        // Crear el primer actor
        Actor result1 = actorService.createActor(actor1);
        assertNotNull(result1);
        
        // Crear el segundo actor con los mismos datos
        Actor result2 = actorService.createActor(actor2);
        assertNotNull(result2);
        
        // Verificar que ambos resultados apuntan al mismo actor en la base de datos
        assertEquals(result1.getId(), result2.getId());
    }

    @Test
    public void testUpdateExistingActorAllFields() throws InstanceNotFoundException {
        Actor updatedData = new Actor();
        updatedData.setName("Robert Downey Jr."); // Use the existing name to locate the actor
        updatedData.setImdbId("nm0000376"); // Update the IMDB ID
        updatedData.setBirthDate(new java.sql.Date(System.currentTimeMillis()));
        updatedData.setBirthPlace("Los Angeles, California, USA");
        updatedData.setHeight("1.80 m");
        updatedData.setBio("Updated biography text");
        updatedData.setImageUrl("https://example.com/updated_image.jpg");

        Actor result = actorService.updateActor(updatedData);

        assertEquals(testActor.getId(), result.getId());
        assertEquals("nm0000376", result.getImdbId());
        assertEquals("Los Angeles, California, USA", result.getBirthPlace());
        assertEquals("1.80 m", result.getHeight());
        assertEquals("Updated biography text", result.getBio());
        assertEquals("https://example.com/updated_image.jpg", result.getImageUrl());
    }

    @Test
    public void testUpdateExistingActorSomeFields() throws InstanceNotFoundException {
        Actor updatedData = new Actor();
        updatedData.setName("Robert Downey Jr."); // Use the existing name to locate the actor
        updatedData.setImdbId("nm0000376"); // Update the IMDB ID
        updatedData.setHeight("1.75 m");

        Actor result = actorService.updateActor(updatedData);

        assertEquals(testActor.getId(), result.getId());
        assertEquals("nm0000376", result.getImdbId());
        assertEquals("1.75 m", result.getHeight());
        assertEquals("Robert John Downey Jr. (born April 4, 1965) is an American actor and producer.", result.getBio());
    }

    @Test
    public void testUpdateExistingActorNoFields() throws InstanceNotFoundException {
        Actor updatedData = new Actor();
        updatedData.setName("Robert Downey Jr."); // Necesario para encontrar el actor

        Actor result = actorService.updateActor(updatedData);

        assertEquals(testActor.getId(), result.getId());
        assertEquals("nm0000375", result.getImdbId());
        assertEquals("New York City, New York, USA", result.getBirthPlace());
        assertEquals("1.74 m", result.getHeight());
        assertEquals("Robert John Downey Jr. (born April 4, 1965) is an American actor and producer.", result.getBio());
    }

    @Test
    public void testCreateActorNew() {
        Actor newActor = new Actor();
        newActor.setName("Chris Hemsworth");
        newActor.setImdbId("nm1165110");
        newActor.setBio("New biography text");
        newActor.setHeight("1.90 m");
        newActor.setBirthPlace("Melbourne, Australia");
        newActor.setImageUrl("https://example.com/chris_hemsworth.jpg");

        Actor result = actorService.createActor(newActor);

        assertNotNull(result);
        assertNotEquals(testActor.getId(), result.getId());
        assertEquals("Chris Hemsworth", result.getName());
        assertEquals("nm1165110", result.getImdbId());
        assertEquals("New biography text", result.getBio());
        assertEquals("1.90 m", result.getHeight());
        assertEquals("Melbourne, Australia", result.getBirthPlace());
        assertEquals("https://example.com/chris_hemsworth.jpg", result.getImageUrl());
    }

    @Test
    public void testCreateActorWithoutNameOrImdbId() {
        Actor newActor = new Actor();
        newActor.setBio("Updated biography");

        assertThrows(IllegalArgumentException.class, () -> {
            actorService.createActor(newActor);
        });
    }
}