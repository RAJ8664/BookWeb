import React from "react";
import { createBrowserRouter } from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute";
import { Navigate } from "react-router-dom"; // Also make sure Navigate is imported


import App from "../app";
import Home from "../pages/home/Home";
import Login from "../components/Login";
import Register from "../components/Register";
import CartPage from "../pages/books/CartPage";
import CheckoutPage from "../pages/books/CheckoutPage"
import UserDashboard from "../components/User-Dashboard";
import UpdateProfile from "../components/UpdateProfile";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />
      },
      {
        path: "/orders",
        element: <div>Orders</div>
      },
      {
        path: "/about",
        element: <div>About</div>
      },
      {
        path: "/login",
        element: <Login />
      },
      {
        path: "/register",
        element: <Register />
      },
      {
        path: "/cart",
        element: <CartPage />
      },
      {
        path: "/checkout",
        element: (
        <ProtectedRoute>
        <CheckoutPage />
        </ProtectedRoute>
      )
      },
      {
        path: "/dashboard",
        element: (
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        )
      },
      {
        path: "/update-profile",
        element: <UpdateProfile />
      },
      
    ]
  }
]);

export default router;