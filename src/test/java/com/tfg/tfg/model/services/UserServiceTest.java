package com.tfg.tfg.model.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.tfg.tfg.model.entities.CustomList;
import com.tfg.tfg.model.entities.CustomListDao;
import com.tfg.tfg.model.entities.Movie;
import com.tfg.tfg.model.entities.MovieDao;
import com.tfg.tfg.model.entities.MovieReview;
import com.tfg.tfg.model.entities.MovieReviewDao;
import com.tfg.tfg.model.entities.Users;
import com.tfg.tfg.model.services.exceptions.DuplicateInstanceException;
import com.tfg.tfg.model.services.exceptions.DuplicateListNameException;
import com.tfg.tfg.model.services.exceptions.IncorrectLoginException;
import com.tfg.tfg.model.services.exceptions.IncorrectPasswordException;
import com.tfg.tfg.model.services.exceptions.InstanceNotFoundException;
import com.tfg.tfg.model.services.exceptions.PermissionException;

@ActiveProfiles("test")
@SpringBootTest
@Transactional
public class UserServiceTest {
	
	private final Long NON_EXISTENT_ID = Long.valueOf(-1);
	
	@Autowired
	private UserService userService;

	@Autowired
	private CustomListService customListService;

	@Autowired
	private MovieReviewDao movieReviewDao;

	@Autowired
	private MovieDao movieDao;

	@Autowired
	private CustomListDao customListDao;
	
	private Users createUser(String userName) {
		return new Users(userName, "password", userName + "@" + userName + ".com", "avatar");
	}
	
	@Test
	public void testSignUpAndLoginFromId() throws DuplicateInstanceException, InstanceNotFoundException, DuplicateListNameException {
		
		Users user = createUser("user");
		
		userService.signUp(user);
		
		Users loggedInUser = userService.loginFromId(user.getId());
		
		assertEquals(user, loggedInUser);

	}
	
	@Test
	public void testSignUpDuplicatedUserName() throws DuplicateInstanceException, DuplicateListNameException, InstanceNotFoundException {
		
		Users user = createUser("user");
		
		userService.signUp(user);
		assertThrows(DuplicateInstanceException.class, () -> userService.signUp(user));
		
	}

	@Test
    public void testSignUpDuplicatedEmail() throws DuplicateInstanceException, DuplicateListNameException, InstanceNotFoundException {
        Users user = createUser("user1");
        
        userService.signUp(user);
        
        Users duplicatedUser = createUser("user2");
        duplicatedUser.setEmail(user.getEmail());
        
        assertThrows(DuplicateInstanceException.class, () -> userService.signUp(duplicatedUser));
    }

	@Test
	public void testSignUpWithoutRole() throws DuplicateInstanceException, DuplicateListNameException, InstanceNotFoundException {
		Users user = createUser("userWithoutRole");
		user.setRole(null); // Sin rol explícito

		userService.signUp(user);

		Users signedUpUser = userService.loginFromId(user.getId());
		assertEquals(Users.RoleType.USER, signedUpUser.getRole()); // Rol por defecto
	}

	@Test
	public void testSignUpWithExplicitRole() throws DuplicateInstanceException, DuplicateListNameException, InstanceNotFoundException {
		Users admin = createUser("admin");
		admin.setRole(Users.RoleType.ADMIN);

		userService.signUp(admin);

		Users signedUpAdmin = userService.loginFromId(admin.getId());
		assertEquals(Users.RoleType.ADMIN, signedUpAdmin.getRole());
	}

	@Test
	public void testSignUpCreatesDefaultLists() throws DuplicateInstanceException, DuplicateListNameException, InstanceNotFoundException {
		Users user = createUser("userWithLists");
		userService.signUp(user);

		List<CustomList> userLists = customListDao.findByUserId(user.getId());
		assertEquals(4, userLists.size());

		Set<String> listNames = userLists.stream()
			.map(CustomList::getName)
			.collect(Collectors.toSet());

		assertTrue(listNames.contains("Películas favoritas"));
		assertTrue(listNames.contains("Pendientes por ver"));
		assertTrue(listNames.contains("Películas vistas"));
		assertTrue(listNames.contains("Películas con las que lloré"));
	}
	
	@Test
	public void testLoginFromNonExistentId() {
		assertThrows(InstanceNotFoundException.class, () -> userService.loginFromId(NON_EXISTENT_ID));
	}
	
	@Test
	public void testLogin() throws DuplicateInstanceException, IncorrectLoginException, DuplicateListNameException, InstanceNotFoundException {
		
		Users user = createUser("user");
		String clearPassword = user.getPassword();
				
		userService.signUp(user);
		
		Users loggedInUser = userService.login(user.getUserName(), clearPassword);
		
		assertEquals(user, loggedInUser);
		
	}
	
	@Test
	public void testLoginWithIncorrectPassword() throws DuplicateInstanceException, DuplicateListNameException, InstanceNotFoundException {
		
		Users user = createUser("user");
		String clearPassword = user.getPassword();
		
		userService.signUp(user);
		assertThrows(IncorrectLoginException.class, () ->
			userService.login(user.getUserName(), 'X' + clearPassword));
		
	}
	
	@Test
	public void testLoginWithNonExistentUserName() {
		assertThrows(IncorrectLoginException.class, () -> userService.login("X", "Y"));
	}
	
	@Test
	public void testUpdateProfile() throws InstanceNotFoundException, DuplicateInstanceException, DuplicateListNameException {
		
		Users user = createUser("user");
		
		userService.signUp(user);
		
        user.setUserName('X' + user.getUserName());
		user.setAvatar('X' + user.getAvatar());
		user.setEmail('X' + user.getEmail());
		
		userService.updateProfile(user.getId(), 'X' + user.getUserName(), 'X' + user.getAvatar(), 'X' + user.getEmail());
		
		Users updatedUser = userService.loginFromId(user.getId());
		
		assertEquals(user, updatedUser);
		
	}
	
	@Test
	public void testUpdateProfileWithNonExistentId() {
		assertThrows(InstanceNotFoundException.class, () ->
			userService.updateProfile(NON_EXISTENT_ID, "X", "X", "X"));
	}
	
	@Test
	public void testChangePassword() throws DuplicateInstanceException, InstanceNotFoundException,
		IncorrectPasswordException, IncorrectLoginException, DuplicateListNameException {
		
        Users user = createUser("user");
        String oldPassword = user.getPassword();
        String newPassword = 'X' + oldPassword;
            
        userService.signUp(user);
        userService.changePassword(user.getId(), oldPassword, newPassword);
        userService.login(user.getUserName(), newPassword);
        assertEquals( 'X' + oldPassword , newPassword);
	
	}
	
	@Test
	public void testChangePasswordWithNonExistentId() {
		assertThrows(InstanceNotFoundException.class, () ->
			userService.changePassword(NON_EXISTENT_ID, "X", "Y"));
	}
	
	@Test
	public void testChangePasswordWithIncorrectPassword() throws DuplicateInstanceException, DuplicateListNameException, InstanceNotFoundException {
		
		Users user = createUser("user");
		String oldPassword = user.getPassword();
		String newPassword = 'X' + oldPassword;
		
		userService.signUp(user);
		assertThrows(IncorrectPasswordException.class, () ->
			userService.changePassword(user.getId(), 'Y' + oldPassword, newPassword));
		
	}

	@Test
	public void testDeleteUserWithNonExistentUser() throws DuplicateInstanceException, InstanceNotFoundException, DuplicateListNameException {
		Users admin = createUser("admin");
		admin.setRole(Users.RoleType.ADMIN);
		userService.signUp(admin);

		assertThrows(InstanceNotFoundException.class, () -> 
			userService.deleteUser(admin.getId(), "nonExistentUser"));
	}

	@Test
	public void testDeleteSelfAsAdmin() throws DuplicateInstanceException, InstanceNotFoundException, DuplicateListNameException {
		Users admin = createUser("admin");
		admin.setRole(Users.RoleType.ADMIN);
		userService.signUp(admin);

		assertThrows(PermissionException.class, () -> 
			userService.deleteUser(admin.getId(), admin.getUserName()));
	}

	@Test
	public void testDeleteUserWithoutAdminRole() throws DuplicateInstanceException, InstanceNotFoundException, DuplicateListNameException {
		Users user = createUser("user");
		userService.signUp(user);

		Users targetUser = createUser("targetUser");
		userService.signUp(targetUser);

		assertThrows(PermissionException.class, () -> 
			userService.deleteUser(user.getId(), targetUser.getUserName()));
	}

	@Test
	public void testDeleteUserSuccessfully() throws InstanceNotFoundException, PermissionException, DuplicateInstanceException, DuplicateListNameException {
		Users admin = createUser("admin");
		admin.setRole(Users.RoleType.ADMIN);
		userService.signUp(admin);

		Users targetUser = createUser("targetUser");
		userService.signUp(targetUser);

		userService.deleteUser(admin.getId(), targetUser.getUserName());

		assertThrows(InstanceNotFoundException.class, () -> 
			userService.loginFromId(targetUser.getId()));
	}

	@Test
	public void testDeleteUserWithReviews() throws InstanceNotFoundException, PermissionException, DuplicateInstanceException, DuplicateListNameException {
		Users admin = createUser("admin");
		admin.setRole(Users.RoleType.ADMIN);
		userService.signUp(admin);

		Users targetUser = createUser("targetUser");
		userService.signUp(targetUser);

		// Crear película asociada a las reseñas
		Movie movie = new Movie();
		movie.setImdbId("tt1234567");
		movie.setTitle("Test Movie");
		movie.setOverview("Overview of the test movie");
		movie.setReleaseYear(2023);
		movie.setVerticalPoster("poster.jpg");
		movie.setRuntime(120);
		movieDao.save(movie);

		// Crear reseñas asociadas al usuario y a la película
		MovieReview review1 = new MovieReview();
		review1.setUser(targetUser);
		review1.setMovie(movie); // Asignar película
		review1.setTitle("Reseña 1");
		review1.setContent("Contenido de la reseña 1");
		
		MovieReview review2 = new MovieReview();
		review2.setUser(targetUser);
		review2.setMovie(movie); // Asignar película
		review2.setTitle("Reseña 2");
		review2.setContent("Contenido de la reseña 2");
		
		movieReviewDao.save(review1);
		movieReviewDao.save(review2);

		// Eliminar el usuario
		userService.deleteUser(admin.getId(), targetUser.getUserName());

		// Verificar que las reseñas se eliminaron
		assertTrue(movieReviewDao.findByUserIdOrderByCreatedAtDesc(targetUser.getId()).isEmpty());

		// Verificar que el usuario ya no existe
		assertThrows(InstanceNotFoundException.class, () -> userService.loginFromId(targetUser.getId()));
	}

	@Test
	public void testDeleteUserWithCustomLists() throws InstanceNotFoundException, PermissionException, DuplicateInstanceException, DuplicateListNameException {
		Users admin = createUser("admin");
		admin.setRole(Users.RoleType.ADMIN);
		userService.signUp(admin);

		Users targetUser = createUser("targetUser");
		userService.signUp(targetUser);

		// Crear listas personalizadas asociadas al usuario
		customListService.createList("Lista personalizada 1", targetUser);
		customListService.createList("Lista personalizada 2", targetUser);

		// Eliminar el usuario
		userService.deleteUser(admin.getId(), targetUser.getUserName());

		// Verificar que las listas personalizadas se eliminaron
		assertTrue(customListDao.findByUserId(targetUser.getId()).isEmpty());

		// Verificar que el usuario ya no existe
		assertThrows(InstanceNotFoundException.class, () -> userService.loginFromId(targetUser.getId()));
	}

}