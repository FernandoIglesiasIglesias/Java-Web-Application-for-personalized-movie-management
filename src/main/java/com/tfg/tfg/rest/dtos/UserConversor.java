package com.tfg.tfg.rest.dtos;

import com.tfg.tfg.model.entities.Users;

/**
 * The Class UserConversor.
 */
public class UserConversor {

	/**
	 * Instantiates a new user conversor.
	 */
	private UserConversor() {
	}

	/**
	 * To user dto.
	 *
	 * @param user the user
	 * @return the user dto
	 */
	public static final UserDto toUserDto(Users user) {
        return new UserDto(
            user.getId(),
            user.getUserName(),
            user.getEmail(),
            user.getAvatar(),
            user.getRole() != null ? user.getRole().name() : null
        );
	}

	/**
	 * To user.
	 *
	 * @param userDto the user dto
	 * @return the user
	 */
	public static final Users toUser(UserDto userDto) {
        Users user = new Users(
            userDto.getUserName(),
            userDto.getPassword(),
            userDto.getEmail(),
            userDto.getAvatar()
        );
        if (userDto.getRole() != null) {
            user.setRole(Users.RoleType.valueOf(userDto.getRole())); 
        }
        return user;
	}
    
	/**
	 * To authenticated user dto.
	 *
	 * @param serviceToken the service token
	 * @param user         the user
	 * @return the authenticated user dto
	 */
	public static final AuthenticatedUserDto toAuthenticatedUserDto(String serviceToken, Users user) {
		return new AuthenticatedUserDto(serviceToken, toUserDto(user));
	}
}