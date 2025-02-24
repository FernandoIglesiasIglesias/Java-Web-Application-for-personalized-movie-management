package com.tfg.tfg.model.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.tfg.tfg.model.entities.Users;
import com.tfg.tfg.model.services.exceptions.DuplicateInstanceException;
import com.tfg.tfg.model.services.exceptions.IncorrectLoginException;
import com.tfg.tfg.model.services.exceptions.IncorrectPasswordException;
import com.tfg.tfg.model.services.exceptions.InstanceNotFoundException;

@ActiveProfiles("test")
@SpringBootTest
@Transactional
public class UserServiceTest {
	
	private final Long NON_EXISTENT_ID = Long.valueOf(-1);
	
	@Autowired
	private UserService userService;
	
	private Users createUser(String userName) {
		return new Users(userName, "password", userName + "@" + userName + ".com", "avatar");
	}
	
	@Test
	public void testSignUpAndLoginFromId() throws DuplicateInstanceException, InstanceNotFoundException {
		
		Users user = createUser("user");
		
		userService.signUp(user);
		
		Users loggedInUser = userService.loginFromId(user.getId());
		
		assertEquals(user, loggedInUser);

	}
	
	@Test
	public void testSignUpDuplicatedUserName() throws DuplicateInstanceException {
		
		Users user = createUser("user");
		
		userService.signUp(user);
		assertThrows(DuplicateInstanceException.class, () -> userService.signUp(user));
		
	}
	
	@Test
	public void testLoginFromNonExistentId() {
		assertThrows(InstanceNotFoundException.class, () -> userService.loginFromId(NON_EXISTENT_ID));
	}
	
	@Test
	public void testLogin() throws DuplicateInstanceException, IncorrectLoginException {
		
		Users user = createUser("user");
		String clearPassword = user.getPassword();
				
		userService.signUp(user);
		
		Users loggedInUser = userService.login(user.getUserName(), clearPassword);
		
		assertEquals(user, loggedInUser);
		
	}
	
	@Test
	public void testLoginWithIncorrectPassword() throws DuplicateInstanceException {
		
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
	public void testUpdateProfile() throws InstanceNotFoundException, DuplicateInstanceException {
		
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
		IncorrectPasswordException, IncorrectLoginException {
		
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
	public void testChangePasswordWithIncorrectPassword() throws DuplicateInstanceException {
		
		Users user = createUser("user");
		String oldPassword = user.getPassword();
		String newPassword = 'X' + oldPassword;
		
		userService.signUp(user);
		assertThrows(IncorrectPasswordException.class, () ->
			userService.changePassword(user.getId(), 'Y' + oldPassword, newPassword));
		
	}

}