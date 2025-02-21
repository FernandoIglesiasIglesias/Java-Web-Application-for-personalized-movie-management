package com.tfg.tfg.model.entities;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
/**
 * Represents a User entity in the system.
 */
@Entity
public class Users {
    
    /**
     * Enum representing the role types a user can have.
     */
    public enum RoleType {USER, ADMIN}

    private Long id;

    private String userName;

    private String password;

    private String email;

    private String avatar;

    private RoleType role;

    /**
     * Default constructor.
     */
    public Users() {}

    /**
     * Parameterized constructor to create a User with the specified details.
     *
     * @param userName the username of the user
     * @param password the password of the user
     * @param email the email address of the user
     */
    public Users(String userName, String password, String email, String avatar) {
        this.userName = userName;
        this.password = password;
        this.email = email;
        this.avatar = avatar;
    }

    /**
     * Gets the ID of the user.
     *
     * @return the ID of the user
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId() {
        return id;
    }

    /**
     * Sets the ID of the user.
     *
     * @param id the ID to set
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Gets the username of the user.
     *
     * @return the username of the user
     */
    public String getUserName() {
        return userName;
    }

    /**
     * Sets the username of the user.
     *
     * @param userName the username to set
     */
    public void setUserName(String userName) {
        this.userName = userName;
    }

    /**
     * Gets the password of the user.
     *
     * @return the password of the user
     */
    public String getPassword() {
        return password;
    }

    /**
     * Sets the password of the user.
     *
     * @param password the password to set
     */
    public void setPassword(String password) {
        this.password = password;
    }

    /**
     * Gets the email address of the user.
     *
     * @return the email address of the user
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
     * Gets the avatar of the user.
     *
     * @return the avatar of the user
     */
    public String getAvatar() {
        return avatar;
    }

    /**
     * Sets the avatar of the user.
     *
     * @param avatar the avatar to set
     */
    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    /**
     * Gets the role of the user.
     *
     * @return the role of the user
     */
    public RoleType getRole() {
        return role;
    }
    
    /**
     * Sets the role of the user.
     *
     * @param role the role to set
     */
    public void setRole(RoleType role) {
        this.role = role;
    }
}