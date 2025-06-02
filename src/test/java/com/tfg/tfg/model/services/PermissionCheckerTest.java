package com.tfg.tfg.model.services;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.tfg.tfg.model.entities.Users;
import com.tfg.tfg.model.entities.UsersDao;
import com.tfg.tfg.model.services.exceptions.InstanceNotFoundException;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
public class PermissionCheckerTest {

    @Autowired
    private PermissionChecker permissionChecker;

    @Autowired
    private UsersDao usersDao;

    private Users testUser;

    @BeforeEach
    public void setUp() {
        // Limpiar la base de datos antes de cada prueba
        usersDao.deleteAll();

        // Crear un usuario de prueba
        testUser = new Users();
        testUser.setUserName("testUser");
        testUser.setPassword("password");
        testUser.setEmail("test@example.com");
        testUser.setAvatar("/images/default-avatar.webp");
        testUser.setRole(Users.RoleType.USER);
        testUser = usersDao.save(testUser);
    }

    @Test
    public void testCheckUserExistsWithExistingUser() throws InstanceNotFoundException {
        // Verificar que no lanza excepción para un usuario existente
        permissionChecker.checkUserExists(testUser.getId());
    }

    @Test
    public void testCheckUserExistsWithNonExistentUser() {
        // Verificar que lanza excepción para un usuario inexistente
        assertThrows(InstanceNotFoundException.class, () -> {
            permissionChecker.checkUserExists(-1L);
        });
    }

    @Test
    public void testCheckUserWithExistingUser() throws InstanceNotFoundException {
        // Verificar que devuelve el usuario correctamente
        Users user = permissionChecker.checkUser(testUser.getId());
        assertNotNull(user);
        assertNotNull(user.getId());
        assertNotNull(user.getUserName());
    }

    @Test
    public void testCheckUserWithNonExistentUser() {
        // Verificar que lanza excepción para un usuario inexistente
        assertThrows(InstanceNotFoundException.class, () -> {
            permissionChecker.checkUser(-1L);
        });
    }
}