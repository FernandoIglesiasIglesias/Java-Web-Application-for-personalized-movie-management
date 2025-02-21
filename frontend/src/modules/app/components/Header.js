import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import "./Header.css";

const Header = ({ user }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={`home-header ${theme}`}>
      <h1 className="home-title">TFG</h1>
      <button onClick={toggleTheme} className={`theme-toggle-button ${theme}`}>
        {theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
      </button>
      {user && (
        <div className="profile-container" onClick={() => navigate("/settings")}>
          <img
            className="profile-avatar"
            alt="user avatar"
            src={user.avatar}
          />
        </div>
      )}
    </header>
  );
};

export default Header;