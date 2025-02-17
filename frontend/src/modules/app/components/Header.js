import React from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";

const Header = ({ user }) => {
  const navigate = useNavigate();

  return (
    <header className="home-header">

      <h1 className="home-title">TFG</h1>

      {user && (
        <button onClick={() => navigate("/settings")}>
          <img
            className="home-user-avatar"
            alt="user avatar"
            src={user.avatar}
          />
        </button>
      )}
      {user && (
        <button onClick={() => navigate(-1)} className="backbttn-header">
          Volver
        </button>
      )}
    </header>
  );
};

export default Header;
