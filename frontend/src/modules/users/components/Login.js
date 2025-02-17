import React, { useState } from "react";
import { login, logout } from "../../../backend/userService";
import { useNavigate } from "react-router-dom";
import { Errors } from "../../common";


const Login = ({ onSuccess, onErrors }) => {
    const navigate = useNavigate();
    const [username, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [backendErrors, setBackendErrors] = useState(null);
    let form;

    const handleSubmit = (e) =>{
        e.preventDefault();

        const validationErrors = {
            globalError: "",
            fieldErrors: []
        };
        
        if(form.checkValidity()){
            login(username, password,
                () => {
                    navigate(0);
                },
                (error) => {
                    if(error.globalError==='project.exceptions.IncorrectLoginException') {
                        validationErrors.fieldErrors.push({
                          fieldName: "Error",
                          message: "Contraseña Incorrecta"
                        });
                    }
                    setBackendErrors(validationErrors)
                },
                () => {
                    navigate("/login");
                    logout();
                }
            )
        } else {
            setBackendErrors(null);
        }
    };

    return(
        <div>
            <div className="auth-container">
                <h1>Identificarse</h1>
                <Errors errors={backendErrors} onClose={() => setBackendErrors(null)} />
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
                        <div className="auth-form-input-submit">
                            <input type="submit" value="Iniciar Sesion" />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;