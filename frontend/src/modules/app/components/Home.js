import React from "react";
import { useTheme } from "../../../context/ThemeContext";
import MovieExplorer from "../../movies/components/MovieExplorer";
import './Home.css';

const Home = ({ user }) => {
  const { theme } = useTheme();

  return (
    <div className={`home-container ${theme}`}>
      <div className={`home-content ${theme}`}>
        <MovieExplorer user={user} />
      </div>
    </div>
  );
};

export default Home;