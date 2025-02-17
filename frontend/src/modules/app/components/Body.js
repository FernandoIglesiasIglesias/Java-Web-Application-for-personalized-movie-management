import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Login from "../../users/components/Login";
import SignUp from "../../users/components/SignUp";
import Title from "../../users/components/Title";
import Settings from "../../users/components/Settings";

const Body = ({ authenticatedUser }) => {
  return (
    <div>
      <Routes>
      <Route path="/*" element={authenticatedUser ? <Navigate to="/home" /> : <Title />} />
      <Route path="/login" element={!authenticatedUser ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={!authenticatedUser ? <SignUp /> : <Navigate to="/" />} />
        <Route path="/settings" element={authenticatedUser ? <Settings user={authenticatedUser.user} /> : <Navigate to="/" />} />
      </Routes>
    </div>
  );
};

export default Body;