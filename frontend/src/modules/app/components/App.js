import React, { useState, useEffect } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { tryLoginFromServiceToken, logout } from "../../../backend/userService";
import { ThemeProvider } from "../../../context/ThemeContext";

import Header from "./Header";
import Login from "../../users/components/Login";
import SignUp from "../../users/components/SignUp";
import Title from "../../users/components/Title";
import Home from "./Home";
import ShowMovie from "../../movies/components/ShowMovie";
import ShowActor from "../../movies/components/ShowActor";
import ShowDirector from "../../movies/components/ShowDirector";
import UserLists from "../../list/components/UserLists";
import MovieListDetails from "../../list/components/MovieListDetails";
import ActorListDetails from "../../list/components/ActorListDetails";
import DirectorListDetails from "../../list/components/DirectorListDetails";
import Settings from "../../users/components/Settings";
import '../../../Global.css';
import '../../../themes.css';

const App = () => {
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const checkAuth = () => {
      tryLoginFromServiceToken(
        (user) => {
          setAuthenticatedUser(user);
          setLoading(false);
        },
        () => {
          logout();
          setAuthenticatedUser(null);
          setLoading(false);
        }
      );
    };

    checkAuth();
  }, []);

  if (loading) return <div className="app-loading">Cargando...</div>;

  return (
    <ThemeProvider value={{ 
      theme, 
      setTheme, 
      toggleTheme: () => setTheme(prev => prev === 'light' ? 'dark' : 'light') 
    }}>
      <Router>
        {authenticatedUser && <Header user={authenticatedUser.user} />}
        
        <div className="app-content">
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={authenticatedUser ? <Navigate to="/home" /> : <Title />} />
            <Route path="/login" element={!authenticatedUser ? <Login setAuthenticatedUser={setAuthenticatedUser} /> : <Navigate to="/home" />} />
            <Route path="/signup" element={!authenticatedUser ? <SignUp setAuthenticatedUser={setAuthenticatedUser} /> : <Navigate to="/home" />} />
            
            {/* Rutas protegidas - requieren autenticación */}
            <Route path="/home" element={authenticatedUser ? <Home user={authenticatedUser.user} /> : <Navigate to="/login" />} />
            <Route path="/settings" element={authenticatedUser ? <Settings user={authenticatedUser.user} setAuthenticatedUser={setAuthenticatedUser}/> : <Navigate to="/login" />} />
            <Route path="/user/lists" element={authenticatedUser ? <UserLists /> : <Navigate to="/login" />} />
            <Route path="/lists/:id" element={authenticatedUser ? <MovieListDetails /> : <Navigate to="/login" />} />
            <Route path="/actor-lists/:id" element={authenticatedUser ? <ActorListDetails /> : <Navigate to="/login" />} />
            <Route path="/director-lists/:id" element={authenticatedUser ? <DirectorListDetails /> : <Navigate to="/login" />} />
            
            {/* Rutas semi-protegidas - muestran contenido pero con funcionalidad limitada para usuarios no autenticados */}
            <Route path="/movies/:id" element={<ShowMovie />} />
            <Route path="/actors/:actorName" element={<ShowActor />} />
            <Route path="/directors/:directorName" element={<ShowDirector />} />
            {/* Ruta de fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;