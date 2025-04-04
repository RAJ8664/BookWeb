import React from "react";

import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const App = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="p-4">
        <Outlet /> {/* Renders child routes (Home/Books/NotFound) */}
      </main>
      <Footer />
    </div>
  );
};

export default App;