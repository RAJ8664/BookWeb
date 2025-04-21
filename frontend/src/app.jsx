import React from "react";
import { AuthProvider } from "./context/AuthContext";
import './app.css';

import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ApiEnvToggle from "./components/ApiEnvToggle";

const App = () => {
  return (
    <>
      <AuthProvider>
        <Navbar />
        <main className="p-4">
          <Outlet /> {/* Renders child routes (Home/Books/NotFound) */}
        </main>
        <Footer />
        {/* API Environment Toggle Button */}
        <ApiEnvToggle />
      </AuthProvider>
    </>
  );
};

export default App;