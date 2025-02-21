package com.tfg.tfg.rest.dtos;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * The Class UserDto.
 */
public class UserDto {
	
	/**
	 * The Interface AllValidations.
	 */
	public interface AllValidations {}
	
	/**
	 * The Interface UpdateValidations.
	 */
	public interface UpdateValidations {}
	/** The id. */
	private Long id;
	
	/** The user name. */
	private String userName;
	
	/** The password. */
	private String password;
	
    /** The email. */
	private String email;
    /** The avatar. */
    private String avatar;
	
	/** The role. */
	private String role;

	/**
	 * Instantiates a new user dto.
	 */
	public UserDto() {}

	/**
	 * Instantiates a new user dto.
	 *
	 * @param id the id
	 * @param userName the user name
	 * @param email the email
	 * @param avatar the avatar
	 * @param role the role
	 */
	public UserDto(Long id, String userName, String email, String avatar, String role) {
		this.id = id;
		this.userName = userName != null ? userName.trim() : null;
		this.email = email;
		this.avatar = avatar;
		this.role = role;
		
	}

	/**
	 * Gets the id.
	 *
	 * @return the id
	 */
	public Long getId() {
		return id;
	}

	/**
	 * Sets the id.
	 *
	 * @param id the new id
	 */
	public void setId(Long id) {
		this.id = id;
	}

	/**
	 * Gets the user name.
	 *
	 * @return the user name
	 */
	@NotNull(groups={AllValidations.class})
	@Size(min=1, max=60, groups={AllValidations.class})
	public String getUserName() {
		return userName;
	}

	/**
	 * Sets the user name.
	 *
	 * @param userName the new user name
	 */
	public void setUserName(String userName) {
		this.userName = userName.trim();
	}
    
	/**
	 * Gets the password.
	 *
	 * @return the password
	 */
	@NotNull(groups={AllValidations.class})
	@Size(min=1, max=60, groups={AllValidations.class})
	public String getPassword() {
		return password;
	}

	/**
	 * Sets the password.
	 *
	 * @param password the new password
	 */
	public void setPassword(String password) {
		this.password = password;
	}

    /**
     * Retrieves the email address of the user.
     *
     * @return the email address of the user.
     */
	public String getEmail() {
		return email;
	}

    /**
     * Sets the email address of the user.
     *
     * @param email the email address to set
     */
	public void setEmail(String email) {
		this.email = email;
	}

    /**
     * Retrieves the avatar of the user.
     *
     * @return the avatar of the user as a String.
     */
	public String getAvatar() {
		return avatar;
	}

    /**
     * Sets the avatar for the user.
     *
     * @param avatar the URL or path of the avatar image to be set
     */
	public void setAvatar(String avatar) {
		this.avatar = avatar;
	}

    /**
	 * Gets the role.
	 *
	 * @return the role
	 */
	public String getRole() {
		return role;
	}
    
	/**
	 * Sets the role.
	 *
	 * @param role the new role
	 */
	public void setRole(String role) {
		this.role = role;
	}
}
