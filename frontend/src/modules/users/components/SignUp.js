import React, { useState } from "react";
import { logout, signUp } from "../../../backend/userService";
import { uploadAvatar } from "../../../backend/uploadService";
import { useNavigate } from "react-router-dom";

import { Errors } from "../../common";

const SignUp = ({ setAuthenticatedUser }) => {
  const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/1077/1077114.png"; // URL del avatar por defecto

  const navigate = useNavigate();
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [passwordsDoNotMatch, setPasswordsDoNotMatch] = useState(false);
  const [backendErrors, setBackendErrors] = useState(null);
  const [avatarErrors, setAvatarErrors] = useState(null);
  let form;

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const handleUploadAvatar = (onSuccess, onError) => {
    if (avatar) {
      uploadAvatar(
        avatar,
        username,
        (imageUrl) => {
          onSuccess(imageUrl);
        },
        (error) => {
          onError(error);
        }
      );
    } else {
      onSuccess(DEFAULT_AVATAR);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = {
      globalError: "",
      fieldErrors: []
    };

    if (validationErrors.fieldErrors.length > 0) {
      setBackendErrors(validationErrors);
      return;
    }

    handleUploadAvatar(
      (imageUrl) => {
        if (form.checkValidity() && checkConfirmPassword()) {
          signUp(
            {
              userName: username,
              password: password,
              email: email,
              avatar: imageUrl,
              role: "USER",
            },
            (authenticatedUser) => {
              setAuthenticatedUser(authenticatedUser);
              navigate("/home");
            },
            (error) => {
              if (error.globalError === 'project.exceptions.DuplicateInstanceException') {
                validationErrors.fieldErrors.push({
                  fieldName: "Error",
                  message: "Ese usuario ya existe"
                });
              }
              setBackendErrors(validationErrors);
            },
            () => {
              navigate("/login");
              logout();
            }
          );
        } else {
          setBackendErrors(null);
        }
      },
      (error) => {
        setAvatarErrors(error);
      }
    );
  };

  const checkConfirmPassword = () => {
    if (password !== confirmPassword) {
      setPasswordsDoNotMatch(true);
      return false;
    } else {
      return true;
    }
  };

  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
    setPasswordsDoNotMatch(false);
  };

  return (
    <div>
      <Errors errors={backendErrors} onClose={() => setBackendErrors(null)} />
      <div className="auth-container">
        <h1>Registrarse</h1>
        <div className="auth-form-container">
          <form ref={node => form = node} onSubmit={handleSubmit} noValidate>
            <div className="auth-form-input">
              <h3>Nombre de usuario</h3>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUserName(e.target.value)}
                required
              />
            </div>
            <div className="auth-form-input">
              <h3>Contraseña</h3>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="auth-form-input">
              <h3>Confirmar la contraseña</h3>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                required
              />
              {passwordsDoNotMatch && <p style={{ color: 'red' }}>{"Las contraseñas no coinciden"}</p>}
            </div>
            <div className="auth-form-input">
              <h3>Email</h3>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="auth-form-input">
              <h3>Avatar (Sube un archivo)</h3>
              <input
                type="file"
                id="avatar"
                onChange={(e) => handleAvatarChange(e)}
                accept="image/*"
              />
              {avatarPreview && <img src={avatarPreview} alt="Vista previa del avatar" style={{ width: '100px', height: '100px' }} />}
              {avatarErrors && <p style={{ color: 'red' }}>{avatarErrors}</p>}
            </div>
            <div className="auth-form-input-submit">
              <input type="submit" value="Finalizar" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;