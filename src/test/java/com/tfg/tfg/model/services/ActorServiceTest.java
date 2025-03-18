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
        testActor.setFirstName("Robert");
        testActor.setLastName("Downey Jr.");
        testActor.setImdbId("nm0000375");
        testActor.setBirthDate(new java.sql.Date(System.currentTimeMillis())); // Fecha actual como ejemplo
        testActor.setBirthPlace("New York City, New York, USA");
        testActor.setStarSign("Aries");
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
        assertEquals("Robert", actor.getFirstName());
        assertEquals("Downey Jr.", actor.getLastName());
        assertEquals("nm0000375", actor.getImdbId());
    }
    
    @Test
    public void testFindByIdNotFound() {
        assertThrows(InstanceNotFoundException.class, () -> {
            actorService.findById(NON_EXISTENT_ID);
        });
    }
    
    @Test
    public void testFindByFirstNameAndLastName() throws InstanceNotFoundException {
        Actor actor = actorService.findByFirstNameAndLastName("Robert", "Downey Jr.");
        
        assertNotNull(actor);
        assertEquals(testActor.getId(), actor.getId());
        assertEquals("nm0000375", actor.getImdbId());
    }
    
    @Test
    public void testFindByFirstNameAndLastNameNotFound() {
        assertThrows(InstanceNotFoundException.class, () -> {
            actorService.findByFirstNameAndLastName("Non", "Existent");
        });
    }
    
    @Test
    public void testFindByImdbId() throws InstanceNotFoundException {
        Actor actor = actorService.findByImdbId("nm0000375");
        
        assertNotNull(actor);
        assertEquals(testActor.getId(), actor.getId());
        assertEquals("Robert", actor.getFirstName());
        assertEquals("Downey Jr.", actor.getLastName());
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
        secondActor.setFirstName("Chris");
        secondActor.setLastName("Evans");
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
        updatedData.setFirstName("Robert");  // Necesario para encontrar el actor
        updatedData.setLastName("Downey Jr."); // Necesario para encontrar el actor
        updatedData.setImdbId("nm0000376"); // Actualizar el IMDB ID
        updatedData.setBio("New biography text"); // Actualizar la biografía
        updatedData.setHeight("1.75 m"); // Actualizar la altura
        
        Actor result = actorService.updateActor(updatedData);
        
        assertNotNull(result);
        assertEquals(testActor.getId(), result.getId());
        assertEquals("Robert", result.getFirstName());
        assertEquals("Downey Jr.", result.getLastName());
        assertEquals("nm0000376", result.getImdbId()); // Debe actualizarse
        assertEquals("1.75 m", result.getHeight()); // Debe actualizarse
        assertEquals("New biography text", result.getBio()); // Debe actualizarse
    }
    
    @Test
    public void testUpdateActorNotFound() {
        Actor nonExistentActor = new Actor();
        nonExistentActor.setFirstName("Non");
        nonExistentActor.setLastName("Existent");
        
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
        updatedData.setFirstName("Robert");  // Añadimos firstName para encontrar el actor
        updatedData.setLastName("Downey Jr."); // Añadimos lastName para encontrar el actor
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
        updatedData.setFirstName("Robert");  // Añadimos firstName para encontrar el actor
        updatedData.setLastName("Downey Jr."); // Añadimos lastName para encontrar el actor
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
        // No establecemos firstName ni lastName
        
        assertThrows(IllegalArgumentException.class, () -> {
            actorService.updateActor(actorWithNullName);
        });
    }
}