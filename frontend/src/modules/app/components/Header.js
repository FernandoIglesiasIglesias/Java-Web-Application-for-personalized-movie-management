import React from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";

const Header = ({ user }) => {
  const navigate = useNavigate();

  return (
    <header className="home-header">
      <h1 className="home-title">TFG</h1>
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