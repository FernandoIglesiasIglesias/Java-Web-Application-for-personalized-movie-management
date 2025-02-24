import React, { useState, useEffect } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { tryLoginFromServiceToken, logout } from "../../../backend/userService";

import Header from "./Header";
import Body from "./Body";
import Title from "../../users/components/Title";
import Home from "./Home";
import ShowMovie from "../../movies/components/ShowMovie";


const App = () => {
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <Header user={authenticatedUser?.user} /> {/* Incluir el Header aquí */}
      <Routes>
        {/* Rutas sin Header */}
        <Route path="/" element={<Title />} />
        <Route path="/home" element={<Home user={authenticatedUser?.user} />} /> {/* Pasar el usuario autenticado */}
        <Route path="/movies/:id" element={<ShowMovie />} />


        {/* Rutas con Header */}
        <Route
          path="*"
          element={
            <Body authenticatedUser={authenticatedUser} setAuthenticatedUser={setAuthenticatedUser} />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;