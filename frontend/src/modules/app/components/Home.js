// filepath: /home/oem/software/tfg/frontend/src/modules/app/components/Home.js
import React from "react";
import Header from "./Header";
import { useTheme } from "../../../context/ThemeContext";
import GetMovies from "../../movies/components/GetMovies";
import './Home.css';

const Home = ({ user }) => {
  const { theme } = useTheme();

  return (
    <div className={`home-container ${theme}`}>
      <Header user={user} />
      <div className={`home-content ${theme}`}>
        <h1>Bienvenido a TFG</h1>
        <p>¡Has iniciado sesión correctamente!</p>
        <GetMovies />
      </div>
    </div>
  );
};

export default Home;