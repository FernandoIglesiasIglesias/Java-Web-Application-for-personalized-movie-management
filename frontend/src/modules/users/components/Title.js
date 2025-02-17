import React from "react";
import './Users.css'
import { Link } from "react-router-dom";

const Title = () => {
  return (
    <div className="auth-container">
        <h1>TFG</h1>
        <div className="login-signup-button-container">
            <Link to="/login">
                <button type="button">Login</button>
            </Link>
            <Link to="/signup">
                <button type="button">SignUp</button>
            </Link>
        </div> 
    </div>
  );
};

export default Title;