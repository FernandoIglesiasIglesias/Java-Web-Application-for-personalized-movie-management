import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import "./Header.css";

const Header = ({ user }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="header">
      <div className="header-logo">
        <Link to="/home">TFG</Link>
      </div>
      
      <nav className="header-nav">
        <div className="nav-item">
          <Link to="/home" className="nav-link">Inicio</Link>
        </div>
        <div className="nav-item">
          <Link to="/user/lists" className="nav-link">Mis Listas</Link>
        </div>
      </nav>
      
      <div className="header-actions">
        <button 
          className="theme-toggle" 
          onClick={toggleTheme} 
          title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        
        {user && (
          <img
            className="user-avatar"
            alt="user avatar"
            src={user.avatar || '/images/default-avatar.webp'}
            onClick={() => navigate("/settings")}
            title="Configuración"
          />
        )}
      </div>
    </header>
  );
};

export default Header;