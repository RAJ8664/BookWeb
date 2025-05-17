import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import React from "react";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;