import React, { useState, useEffect } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { tryLoginFromServiceToken, logout } from "../../../backend/userService";

import Header from "./Header";
import Body from "./Body";
import Title from "../../users/components/Title";

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
      <Routes>
        {/* Rutas sin Header */}
        <Route path="/" element={<Title />} />

        {/* Rutas con Header */}
        <Route
          path="*"
          element={
            <>
              <Header user={authenticatedUser?.user} />
              <Body authenticatedUser={authenticatedUser} />
            </>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
