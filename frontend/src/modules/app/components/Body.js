import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Login from "../../users/components/Login";
import SignUp from "../../users/components/SignUp";
import Title from "../../users/components/Title";
import Settings from "../../users/components/Settings";
import ShowMovie from "../../movies/components/ShowMovie";

const Body = ({ authenticatedUser, setAuthenticatedUser }) => {
  return (
    <div>
      <Routes>
        <Route path="/*" element={authenticatedUser ? <Navigate to="/home" /> : <Title />} />
        <Route path="/login" element={!authenticatedUser ? <Login setAuthenticatedUser={setAuthenticatedUser} /> : <Navigate to="/home" />} />
        <Route path="/signup" element={!authenticatedUser ? <SignUp setAuthenticatedUser={setAuthenticatedUser} /> : <Navigate to="/home" />} />
        <Route path="/settings" element={authenticatedUser ? <Settings user={authenticatedUser.user} /> : <Navigate to="/" />} />
        <Route path="/movies/:id" element={<ShowMovie />} />
      </Routes>
    </div>
  );
};

export default Body;