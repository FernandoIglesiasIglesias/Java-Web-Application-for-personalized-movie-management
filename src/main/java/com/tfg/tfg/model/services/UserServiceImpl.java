package com.tfg.tfg.model.services;

import java.util.List;
import java.util.Optional;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.tfg.tfg.model.entities.ActorList;
import com.tfg.tfg.model.entities.ActorListDao;
import com.tfg.tfg.model.entities.CustomList;
import com.tfg.tfg.model.entities.CustomListDao;
import com.tfg.tfg.model.entities.DirectorList;
import com.tfg.tfg.model.entities.DirectorListDao;
import com.tfg.tfg.model.entities.MovieReview;
import com.tfg.tfg.model.entities.MovieReviewDao;
import com.tfg.tfg.model.entities.RatingDao;
import com.tfg.tfg.model.entities.ReviewVoteDao;
import com.tfg.tfg.model.entities.UserActivityDao;
import com.tfg.tfg.model.entities.UserProfileDao;
import com.tfg.tfg.model.entities.Users;
import com.tfg.tfg.model.entities.UsersDao;
import com.tfg.tfg.model.services.exceptions.DuplicateInstanceException;
import com.tfg.tfg.model.services.exceptions.DuplicateListNameException;
import com.tfg.tfg.model.services.exceptions.IncorrectLoginException;
import com.tfg.tfg.model.services.exceptions.IncorrectPasswordException;
import com.tfg.tfg.model.services.exceptions.InstanceNotFoundException;
import com.tfg.tfg.model.services.exceptions.PermissionException;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserServiceImpl implements UserService{

	private final PermissionChecker permissionChecker;
	private final BCryptPasswordEncoder passwordEncoder;
	private final UsersDao userDao;
	private final CustomListDao customListDao;
	private final ActorListDao actorListDao;
	private final DirectorListDao directorListDao;
	private final CustomListService customListService;
	private final ActorListService actorListService;
	private final DirectorListService directorListService;
	private final RatingDao ratingDao;
	private final UserProfileDao userProfileDao;
	private final UserActivityDao userActivityDao;
	private final ReviewVoteDao reviewVoteDao;
	private final MovieReviewDao movieReviewDao;

	public UserServiceImpl(PermissionChecker permissionChecker, BCryptPasswordEncoder passwordEncoder, UsersDao userDao, CustomListService customListService, ActorListService actorListService, DirectorListService directorListService, CustomListDao customListDao, ActorListDao actorListDao, DirectorListDao directorListDao, RatingDao ratingDao, UserProfileDao userProfileDao, UserActivityDao userActivityDao, ReviewVoteDao reviewVoteDao, MovieReviewDao movieReviewDao) {
		this.permissionChecker = permissionChecker;
		this.passwordEncoder = passwordEncoder;
		this.userDao = userDao;
		this.customListService = customListService;
		this.actorListService = actorListService;
		this.directorListService = directorListService;
		this.customListDao = customListDao;
		this.actorListDao = actorListDao;
		this.directorListDao = directorListDao;
		this.ratingDao = ratingDao;
		this.userProfileDao = userProfileDao;
		this.userActivityDao = userActivityDao;
		this.reviewVoteDao = reviewVoteDao;
		this.movieReviewDao = movieReviewDao;
	}
	
	/**
	 * Registers a new user in the system.
	 *
	 * @param user the user to be registered
	 * @throws DuplicateInstanceException if a user with the same username already exists
	 * @throws DuplicateListNameException if a username or a email already exists
	 * @throws InstanceNotFoundException if a user is not found
	*/
	@Override
	public void signUp(Users user) throws DuplicateInstanceException, DuplicateListNameException, InstanceNotFoundException {
		
		if (userDao.existsByUserName(user.getUserName())) {
			throw new DuplicateInstanceException("project.entities.user", user.getUserName());
		}

		if (userDao.existsByEmail(user.getEmail())) {
			throw new DuplicateInstanceException("project.entities.email", user.getEmail());
		}
			
		user.setPassword(passwordEncoder.encode(user.getPassword()));

		if (user.getRole() == null) {
        	user.setRole(Users.RoleType.USER);
    	}

		userDao.save(user);
		
		customListService.createList("Películas favoritas", user);
		customListService.createList("Pendientes por ver", user);
		customListService.createList("Películas vistas", user);
		customListService.createList("Películas con las que lloré", user);

		actorListService.createActorList(user.getId(), "Actores favoritos");

		directorListService.createDirectorList(user.getId(), "Directores favoritos");
	}

    /**
     * Authenticates a user based on the provided username and password.
     *
     * @param userName the username of the user attempting to log in
     * @param password the password of the user attempting to log in
     * @return the authenticated user if the login is successful
     * @throws IncorrectLoginException if the username does not exist or the password is incorrect
     */
	@Override
	@Transactional(readOnly=true)
	public Users login(String userName, String password) throws IncorrectLoginException {
		
		Optional<Users> user = userDao.findByUserName(userName);
		
		if (!user.isPresent()) {
			throw new IncorrectLoginException(userName, password);
		}
		
		if (!passwordEncoder.matches(password, user.get().getPassword())) {
			throw new IncorrectLoginException(userName, password);
		}
		
		return user.get();
		
	}
	
    /**
     * Logs in a user based on their ID.
     *
     * @param id the ID of the user to log in
     * @return the user associated with the given ID
     * @throws InstanceNotFoundException if no user is found with the given ID
     */
	@Override
	@Transactional(readOnly=true)
	public Users loginFromId(Long id) throws InstanceNotFoundException {
		return permissionChecker.checkUser(id);
	}

    /**
     * Updates the profile of a user with the given details.
     *
     * @param id the ID of the user to update
     * @param userName the new username for the user
     * @param avatar the new avatar URL for the user
     * @param email the new email address for the user
     * @return the updated user object
     * @throws InstanceNotFoundException if the user with the given ID is not found
     */
	@Override
	public Users updateProfile(Long id, String userName, String avatar, String email) throws InstanceNotFoundException, DuplicateInstanceException {
		Users user = permissionChecker.checkUser(id);

		// Verificar si el nombre de usuario ya está en uso por otro usuario
		if (!user.getUserName().equals(userName) && userDao.existsByUserName(userName)) {
			throw new DuplicateInstanceException("project.entities.user", userName);
		}

		// Verificar si el correo electrónico ya está en uso por otro usuario
		if (!user.getEmail().equals(email) && userDao.existsByEmail(email)) {
			throw new DuplicateInstanceException("project.entities.email", email);
		}

		user.setUserName(userName);
		user.setAvatar(avatar);
		user.setEmail(email);

		return user;
	}
    
    /**
     * Changes the password of a user.
     *
     * @param id the ID of the user whose password is to be changed
     * @param oldPassword the current password of the user
     * @param newPassword the new password to be set for the user
     * @throws InstanceNotFoundException if the user with the specified ID is not found
     * @throws IncorrectPasswordException if the provided old password does not match the user's current password
     */
	@Override
	public void changePassword(Long id, String oldPassword, String newPassword)
		throws InstanceNotFoundException, IncorrectPasswordException {
		
		Users user = permissionChecker.checkUser(id);
		
		if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
			throw new IncorrectPasswordException();
		} else {
			user.setPassword(passwordEncoder.encode(newPassword));
		}
		
	}

	/**
	 * Deletes a user from the system.
	 * 
	 * @param adminId The ID of the administrator attempting to delete the user
	 * @param userNameToDelete The username of the user to be deleted
	 * @throws InstanceNotFoundException If the user to delete does not exist
	 * @throws PermissionException If the user attempting to delete is not an admin or if admin tries to delete themselves
	 */
	@Override
	public void deleteUser(Long adminId, String userNameToDelete) 
			throws InstanceNotFoundException, PermissionException {

		Users admin = permissionChecker.checkUser(adminId);
		if (admin.getRole() != Users.RoleType.ADMIN) {
			throw new PermissionException("Solo los administradores pueden eliminar usuarios");
		}

		Optional<Users> userToDeleteOpt = userDao.findByUserName(userNameToDelete);
		if (!userToDeleteOpt.isPresent()) {
			throw new InstanceNotFoundException("project.entities.user", userNameToDelete);
		}

		Users userToDelete = userToDeleteOpt.get();

		if (adminId.equals(userToDelete.getId())) {
			throw new PermissionException("Un administrador no puede eliminarse a sí mismo");
		}

		// Eliminar todas las reseñas del usuario
		List<MovieReview> reviews = movieReviewDao.findByUserIdOrderByCreatedAtDesc(userToDelete.getId());
		movieReviewDao.deleteAll(reviews);

		// Eliminar todas las listas de actores del usuario
		List<ActorList> actorLists = actorListDao.findByUserId(userToDelete.getId());
		actorListDao.deleteAll(actorLists);

		// Eliminar todas las listas de directores del usuario
		List<DirectorList> directorLists = directorListDao.findByUserId(userToDelete.getId());
		directorListDao.deleteAll(directorLists);

		// Eliminar todas las listas personalizadas del usuario
		List<CustomList> customLists = customListDao.findByUserId(userToDelete.getId());
		customListDao.deleteAll(customLists);

		// Eliminar las valoraciones del usuario
		ratingDao.deleteByUserId(userToDelete.getId());

		// Eliminar actividades del usuario
		userActivityDao.deleteByUserId(userToDelete.getId());

		// Eliminar votos realizados por el usuario en otras reseñas
		reviewVoteDao.deleteByUserId(userToDelete.getId());

		// Eliminar perfil de usuario
		userProfileDao.deleteById(userToDelete.getId());

		// Finalmente, eliminar el usuario
		userDao.delete(userToDelete);
	}
    
}