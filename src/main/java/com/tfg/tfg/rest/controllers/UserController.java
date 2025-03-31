package com.tfg.tfg.rest.controllers;

import java.net.URI;
import java.util.List;
import java.util.Locale;
import static com.tfg.tfg.rest.dtos.UserConversor.toUser;
import static com.tfg.tfg.rest.dtos.UserConversor.toUserDto;
import static com.tfg.tfg.rest.dtos.UserConversor.toAuthenticatedUserDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import com.tfg.tfg.model.entities.Users;
import com.tfg.tfg.model.services.UserService;
import com.tfg.tfg.model.services.exceptions.DuplicateInstanceException;
import com.tfg.tfg.model.services.exceptions.DuplicateListNameException;
import com.tfg.tfg.model.services.exceptions.IncorrectLoginException;
import com.tfg.tfg.model.services.exceptions.IncorrectPasswordException;
import com.tfg.tfg.model.services.exceptions.InstanceNotFoundException;
import com.tfg.tfg.model.services.exceptions.PermissionException;
import com.tfg.tfg.rest.common.ErrorsDto;
import com.tfg.tfg.rest.common.FieldErrorDto;
import com.tfg.tfg.rest.common.JwtGenerator;
import com.tfg.tfg.rest.common.JwtInfo;
import com.tfg.tfg.rest.dtos.AuthenticatedUserDto;
import com.tfg.tfg.rest.dtos.ChangePasswordParamsDto;
import com.tfg.tfg.rest.dtos.LoginParamsDto;
import com.tfg.tfg.rest.dtos.UserDto;

@RestController
@RequestMapping("/users")
public class UserController {
   
	private static final String INCORRECT_LOGIN_EXCEPTION_CODE = "project.exceptions.IncorrectLoginException";
	private static final String INCORRECT_PASSWORD_EXCEPTION_CODE = "project.exceptions.IncorrectPasswordException";
	private static final String DUPLICATE_INSTANCE_EXCEPTION_CODE = "project.exceptions.DuplicateInstanceException";

	private final MessageSource messageSource;
	private final JwtGenerator jwtGenerator;
	private final UserService userService;
	
	public UserController(MessageSource messageSource, JwtGenerator jwtGenerator, UserService userService) {
		this.messageSource = messageSource;
		this.jwtGenerator = jwtGenerator;
		this.userService = userService;
	}
	
	@ExceptionHandler(IncorrectLoginException.class)
	@ResponseStatus(HttpStatus.NOT_FOUND)
	@ResponseBody
	public ErrorsDto handleIncorrectLoginException(IncorrectLoginException exception, Locale locale) {
		
		String errorMessage = messageSource.getMessage(INCORRECT_LOGIN_EXCEPTION_CODE, null,
				INCORRECT_LOGIN_EXCEPTION_CODE, locale);
		return new ErrorsDto(errorMessage);
		
	}
	
	@ExceptionHandler(IncorrectPasswordException.class)
	@ResponseStatus(HttpStatus.NOT_FOUND)
	@ResponseBody
	public ErrorsDto handleIncorrectPasswordException(IncorrectPasswordException exception, Locale locale) {
		
		String errorMessage = messageSource.getMessage(INCORRECT_PASSWORD_EXCEPTION_CODE, null,
				INCORRECT_PASSWORD_EXCEPTION_CODE, locale);
		return new ErrorsDto(errorMessage);
		
	}

	@ExceptionHandler(DuplicateInstanceException.class)
	@ResponseStatus(HttpStatus.CONFLICT)
	@ResponseBody
	public ErrorsDto handleDuplicateInstanceException(DuplicateInstanceException exception, Locale locale) {
		String errorMessage = messageSource.getMessage(DUPLICATE_INSTANCE_EXCEPTION_CODE, 
			new Object[] {exception.getName()}, DUPLICATE_INSTANCE_EXCEPTION_CODE, locale);
		
		ErrorsDto errorDto = new ErrorsDto(errorMessage);
		
		if (exception.getName() != null && exception.getName().contains("@")) {
			errorDto.setFieldErrors(List.of(
				new FieldErrorDto("email", "Este correo electrónico ya está en uso")
			));
		} else {
			errorDto.setFieldErrors(List.of(
				new FieldErrorDto("userName", "Este nombre de usuario ya está registrado")
			));
		}
		
		return errorDto;
	}

	@PostMapping("/signUp")
	public ResponseEntity<AuthenticatedUserDto> signUp(
		@Validated({UserDto.AllValidations.class}) @RequestBody UserDto userDto) throws DuplicateInstanceException, DuplicateListNameException, InstanceNotFoundException {
		
		Users user = toUser(userDto);
		
		userService.signUp(user);
		
		URI location = ServletUriComponentsBuilder
			.fromCurrentRequest().path("/{id}")
			.buildAndExpand(user.getId()).toUri();
	
		return ResponseEntity.created(location).body(toAuthenticatedUserDto(generateServiceToken(user), user));
	}
	
	@PostMapping("/login")
	public AuthenticatedUserDto login(@Validated @RequestBody LoginParamsDto params)
		throws IncorrectLoginException {
		
		Users user = userService.login(params.getUserName(), params.getPassword());
			
		return toAuthenticatedUserDto(generateServiceToken(user), user);
		
	}
	
	@PostMapping("/loginFromServiceToken")
	public AuthenticatedUserDto loginFromServiceToken(@RequestAttribute Long userId, 
		@RequestAttribute String serviceToken) throws InstanceNotFoundException {
		
		Users user = userService.loginFromId(userId);
		
		return toAuthenticatedUserDto(serviceToken, user);
		
	}
	@PutMapping("/{id}")
	public UserDto updateProfile(@RequestAttribute Long userId, @PathVariable Long id,
		@Validated({UserDto.UpdateValidations.class}) @RequestBody UserDto userDto) 
		throws InstanceNotFoundException, PermissionException {
				
		if (!id.equals(userId)) {
			throw new PermissionException();
		}
		
		return toUserDto(userService.updateProfile(id, userDto.getUserName(), userDto.getAvatar(),
			userDto.getEmail()));
		
	}
	
	@PostMapping("/{id}/changePassword")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void changePassword(@RequestAttribute Long userId, @PathVariable Long id,
		@Validated @RequestBody ChangePasswordParamsDto params)
		throws PermissionException, InstanceNotFoundException, IncorrectPasswordException {
		
		if (!id.equals(userId)) {
			throw new PermissionException();
		}
		
		userService.changePassword(id, params.getOldPassword(), params.getNewPassword());
		
	}
	
	private String generateServiceToken(Users user) {
		
		JwtInfo jwtInfo = new JwtInfo(user.getId(), user.getUserName(), user.getRole().toString());
		
		return jwtGenerator.generate(jwtInfo);
		
	}
}
