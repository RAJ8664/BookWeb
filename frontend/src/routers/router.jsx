import React from "react";
import { createBrowserRouter } from "react-router-dom";

import ProtectedRoute from "../routers/ProtectedRoute";
import { Navigate } from "react-router-dom"; // Also make sure Navigate is imported


import App from "../app";
import Home from "../pages/home/Home";
import Login from "../components/Login";
import Register from "../components/Register";
import CartPage from "../pages/books/CartPage";
import CheckoutPage from "../pages/books/CheckoutPage"
import UserDashboard from "../components/User-Dashboard";
import UpdateProfile from "../components/UpdateProfile";
import SingleBook from "../pages/books/singleBook";
import OrdersPage from "../pages/books/orderPage";


// Error boundary component
const ErrorBoundary = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Oops! Something went wrong</h1>
      <p className="text-gray-600 mb-6">We're sorry, but there was an error loading this page.</p>
      <button 
        onClick={() => window.location.href = '/'}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Return to Home
      </button>
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: "/",
        element: <Home />
      },
      {
        path: "/orders",
        element: <ProtectedRoute><OrdersPage /></ProtectedRoute>
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
      {
        path: "/books/:id",
        element: <SingleBook />
      },
      
    ]
  }
]);

export default router;