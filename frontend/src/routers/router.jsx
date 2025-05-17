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
import UserSettings from "../components/UserSettings";
import WishList from "../components/WishList";
import SingleBook from "../pages/books/singleBook";
import OrdersPage from "../pages/books/orderPage";
import AboutPage from "../components/AboutPage";
import ContactPage from "../components/ContactPage";
import SearchPrefix from "../pages/books/SearchPrefix";
import AllBooks from "../pages/books/AllBooks";
import CategoryBooks from "../pages/categories/CategoryBooks";

import NewArrival from "../pages/SecondaryNavigationPage/NewArrival";
import BestSellers from "../pages/SecondaryNavigationPage/BestSellers";
import AwardWinners from "../pages/SecondaryNavigationPage/AwardWinners";
import RequestBook from "../pages/SecondaryNavigationPage/RequestBook";

// Payment Pages
import EsewaSuccess from "../pages/payment/EsewaSuccess";
import EsewaFailure from "../pages/payment/EsewaFailure";

import AdminRoute from "./AdminRoute";
import AdminLogin from "../components/AdminLogin"
import DashboardLayout from "../pages/dashboard/DashboardLayout";
import Dashboard from "../pages/dashboard/Dashboard";
import ManageBooks from "../pages/dashboard/manageBooks/ManageBooks";
import AddBook from "../pages/dashboard/addBook/AddBook";
import UpdateBook from "../pages/dashboard/EditBook/UpdateBook";
import ManageOrders from "../pages/dashboard/manageOrders/ManageOrders";
import ManageBookRequests from "../pages/dashboard/manageBooks/ManageBookRequests";
import BulkBookUpload from "../pages/dashboard/bulkUpload/BulkBookUpload";  

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
        element: <AboutPage />
      },
      {
        path: "/contact",
        element: <ContactPage />
      },
      {
        path: "/books",
        element: <AllBooks />
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
        path: "/userdashboard",
        element: (
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        )
      },
      {
        path: "/settings",
        element: (
          <ProtectedRoute>
            <UserSettings />
          </ProtectedRoute>
        )
      },
      {
        path: "/wishlist",
        element: <WishList />
      },
      {
        path: "/update-profile",
        element: <UpdateProfile />
      },
      {
        path: "/books/:id",
        element: <SingleBook />
      },
      {
        path: "/new-arrivals",
        element: <NewArrival />
      },
      {
        path: "/best-sellers",
        element: <BestSellers />
      },
      {
        path: "/award-winners",
        element: <AwardWinners />
      },
      {
        path: "/request-book",
        element: <RequestBook />
      },
      {
        path: "/categories/:category",
        element: <CategoryBooks />
      },
      // eSewa payment routes
      {
        path: "/payment/esewa/success",
        element: <EsewaSuccess />
      },
      {
        path: "/payment/esewa/failure",
        element: <EsewaFailure />
      },
      {
        path : "/search/:query",
        element : <SearchPrefix />
      },
    ]
  },
  { 
    path: "/admin",
    element: <AdminLogin /> 

  },
  {
    path: "/dashboard",
    element: <AdminRoute><DashboardLayout /></AdminRoute>,
    children: [
      {
        path: "",
        element: <AdminRoute><Dashboard /></AdminRoute>
      },
      {
        path: "add-new-book",
        element: <AdminRoute><AddBook /></AdminRoute>
      },
      {
        path: "bulk-upload",
        element: <AdminRoute><BulkBookUpload /></AdminRoute>
      },
      {
        path: "edit-book/:id",
        element: <AdminRoute><UpdateBook /></AdminRoute>
      },
      {
        path: "manage-books",
        element: <AdminRoute><ManageBooks /></AdminRoute  >
      },
      {
        path: "manage-orders",
        element: <AdminRoute><ManageOrders /></AdminRoute>
      },
      {
        path: "manage-book-requests",
        element: <AdminRoute><ManageBookRequests /></AdminRoute>
      }
    ]
  }
]);

export default router;