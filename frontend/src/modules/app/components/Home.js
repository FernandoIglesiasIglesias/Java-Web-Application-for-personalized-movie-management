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
        <GetMovies />
      </div>
    </div>
  );
};

export default Home;