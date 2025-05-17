import React, { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

import ProtectedRoute from "../routers/ProtectedRoute";
import AdminRoute from "../routers/AdminRoute";
import { Navigate } from "react-router-dom"; // Also make sure Navigate is imported
import ErrorBoundary from "../components/ErrorBoundary";

import App from "../app";

// Implement Suspense fallback component
const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    <p className="mt-4 text-lg text-gray-600">Loading content...</p>
  </div>
);

// Lazy loaded components - Main navigation
const Home = lazy(() => import("../pages/home/Home"));
const Login = lazy(() => import("../components/Login"));
const Register = lazy(() => import("../components/Register"));
const CartPage = lazy(() => import("../pages/books/CartPage"));
const CheckoutPage = lazy(() => import("../pages/books/CheckoutPage"));
const UserDashboard = lazy(() => import("../components/User-Dashboard"));
const UpdateProfile = lazy(() => import("../components/UpdateProfile"));
const UserSettings = lazy(() => import("../components/UserSettings"));
const WishList = lazy(() => import("../components/WishList"));
const SingleBook = lazy(() => import("../pages/books/singleBook"));
const OrdersPage = lazy(() => import("../pages/books/orderPage"));
const AboutPage = lazy(() => import("../components/AboutPage"));
const ContactPage = lazy(() => import("../components/ContactPage"));
const AllBooks = lazy(() => import("../pages/books/AllBooks"));
const CategoryBooks = lazy(() => import("../pages/categories/CategoryBooks"));

// Lazy loaded components - Secondary navigation
const NewArrival = lazy(() => import("../pages/SecondaryNavigationPage/NewArrival"));
const BestSellers = lazy(() => import("../pages/SecondaryNavigationPage/BestSellers"));
const AwardWinners = lazy(() => import("../pages/SecondaryNavigationPage/AwardWinners"));
const RequestBook = lazy(() => import("../pages/SecondaryNavigationPage/RequestBook"));

// Lazy loaded components - Payment pages
const EsewaSuccess = lazy(() => import("../pages/payment/EsewaSuccess"));
const EsewaFailure = lazy(() => import("../pages/payment/EsewaFailure"));

// Lazy loaded components - Admin pages
const AdminLogin = lazy(() => import("../components/AdminLogin"));
const DashboardLayout = lazy(() => import("../pages/dashboard/DashboardLayout"));
const Dashboard = lazy(() => import("../pages/dashboard/Dashboard"));
const ManageBooks = lazy(() => import("../pages/dashboard/manageBooks/ManageBooks"));
const AddBook = lazy(() => import("../pages/dashboard/addBook/AddBook"));
const UpdateBook = lazy(() => import("../pages/dashboard/EditBook/UpdateBook"));
const ManageOrders = lazy(() => import("../pages/dashboard/manageOrders/ManageOrders"));
const ManageBookRequests = lazy(() => import("../pages/dashboard/manageBooks/ManageBookRequests"));
const BulkBookUpload = lazy(() => import("../pages/dashboard/bulkUpload/BulkBookUpload"));

// Helper function to wrap routes with Suspense and ErrorBoundary
const withSuspense = (Element) => (
  <ErrorBoundary>
    <Suspense fallback={<LoadingFallback />}>
      {Element}
    </Suspense>
  </ErrorBoundary>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorBoundary><div className="min-h-screen flex items-center justify-center">Route not found or error occurred</div></ErrorBoundary>,
    children: [
      {
        path: "/",
        element: withSuspense(<Home />)
      },
      {
        path: "/orders",
        element: <ProtectedRoute>{withSuspense(<OrdersPage />)}</ProtectedRoute>
      },
      {
        path: "/about",
        element: withSuspense(<AboutPage />)
      },
      {
        path: "/contact",
        element: withSuspense(<ContactPage />)
      },
      {
        path: "/books",
        element: withSuspense(<AllBooks />)
      },
      {
        path: "/login",
        element: withSuspense(<Login />)
      },
      {
        path: "/register",
        element: withSuspense(<Register />)
      },
      {
        path: "/cart",
        element: withSuspense(<CartPage />)
      },
      {
        path: "/checkout",
        element: (
        <ProtectedRoute>
          {withSuspense(<CheckoutPage />)}
        </ProtectedRoute>
      )
      },
      {
        path: "/userdashboard",
        element: (
          <ProtectedRoute>
            {withSuspense(<UserDashboard />)}
          </ProtectedRoute>
        )
      },
      {
        path: "/settings",
        element: (
          <ProtectedRoute>
            {withSuspense(<UserSettings />)}
          </ProtectedRoute>
        )
      },
      {
        path: "/wishlist",
        element: withSuspense(<WishList />)
      },
      {
        path: "/update-profile",
        element: withSuspense(<UpdateProfile />)
      },
      {
        path: "/books/:id",
        element: withSuspense(<SingleBook />)
      },
      {
        path: "/new-arrivals",
        element: withSuspense(<NewArrival />)
      },
      {
        path: "/best-sellers",
        element: withSuspense(<BestSellers />)
      },
      {
        path: "/award-winners",
        element: withSuspense(<AwardWinners />)
      },
      {
        path: "/request-book",
        element: withSuspense(<RequestBook />)
      },
      {
        path: "/categories/:category",
        element: withSuspense(<CategoryBooks />)
      },
      // eSewa payment routes
      {
        path: "/payment/esewa/success",
        element: withSuspense(<EsewaSuccess />)
      },
      {
        path: "/payment/esewa/failure",
        element: withSuspense(<EsewaFailure />)
      }
    ]
  },
  {
    path: "/admin",
    element: withSuspense(<AdminLogin />) 
  },
  {
    path: "/dashboard",
    element: <AdminRoute>{withSuspense(<DashboardLayout />)}</AdminRoute>,
    children: [
      {
        path: "",
        element: <AdminRoute>{withSuspense(<Dashboard />)}</AdminRoute>
      },
      {
        path: "add-new-book",
        element: <AdminRoute>{withSuspense(<AddBook />)}</AdminRoute>
      },
      {
        path: "bulk-upload",
        element: <AdminRoute>{withSuspense(<BulkBookUpload />)}</AdminRoute>
      },
      {
        path: "edit-book/:id",
        element: <AdminRoute>{withSuspense(<UpdateBook />)}</AdminRoute>
      },
      {
        path: "manage-books",
        element: <AdminRoute>{withSuspense(<ManageBooks />)}</AdminRoute>
      },
      {
        path: "manage-orders",
        element: <AdminRoute>{withSuspense(<ManageOrders />)}</AdminRoute>
      },
      {
        path: "manage-book-requests",
        element: <AdminRoute>{withSuspense(<ManageBookRequests />)}</AdminRoute>
      }
    ]
  }
]);

export default router;