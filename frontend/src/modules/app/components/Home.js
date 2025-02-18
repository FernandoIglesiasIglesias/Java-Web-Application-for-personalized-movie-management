import React from "react";
import Header from "./Header";
import './Home.css';

const Home = ({ user }) => {
  return (
    <div className="home-container">
      <Header user={user} />
      <div className="home-content">
        <h1>Bienvenido a TFG</h1>
        <p>¡Has iniciado sesión correctamente!</p>
      </div>
    </div>
  );
};

export default Home;