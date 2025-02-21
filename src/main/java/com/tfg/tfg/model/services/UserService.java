package com.tfg.tfg.model.services;

import com.tfg.tfg.model.entities.Users;
import com.tfg.tfg.model.services.exceptions.DuplicateInstanceException;
import com.tfg.tfg.model.services.exceptions.IncorrectLoginException;
import com.tfg.tfg.model.services.exceptions.IncorrectPasswordException;
import com.tfg.tfg.model.services.exceptions.InstanceNotFoundException;

public interface UserService {
    
    void signUp(Users user) throws DuplicateInstanceException;
	
	Users login(String userName, String password) throws IncorrectLoginException;
	
	Users loginFromId(Long id) throws InstanceNotFoundException;
	
	Users updateProfile(Long id, String userName,String avatar, String email) throws InstanceNotFoundException;
	
	void changePassword(Long id, String oldPassword, String newPassword)
		throws InstanceNotFoundException, IncorrectPasswordException;
    
}