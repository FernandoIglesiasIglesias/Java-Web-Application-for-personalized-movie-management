import React from "react";
import Header from "./Header";

const Home = ({ user }) => {
  return (
    <div>
      <Header user={user} />
      <div>
        <h1>Bienvenido a TFG</h1>
        <p>¡Has iniciado sesión correctamente!</p>
      </div>
    </div>
  );
};

export default Home;