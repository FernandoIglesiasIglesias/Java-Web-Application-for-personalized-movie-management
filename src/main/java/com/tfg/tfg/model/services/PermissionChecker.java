package com.tfg.tfg.model.services;

import com.tfg.tfg.model.entities.Users;
import com.tfg.tfg.model.services.exceptions.InstanceNotFoundException;

/**
 * The Interface PermissionChecker.
 */
public interface PermissionChecker {
    
	/**
	 * Check user exists.
	 *
	 * @param userId the user id
	 * @throws InstanceNotFoundException the instance not found exception
	 */
	public void checkUserExists(Long userId) throws InstanceNotFoundException;
	
	/**
	 * Check user.
	 *
	 * @param userId the user id
	 * @return the user
	 * @throws InstanceNotFoundException the instance not found exception
	 */
	public Users checkUser(Long userId) throws InstanceNotFoundException;
}