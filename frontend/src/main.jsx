import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./routers/router";
import "./index.css";
import { Provider } from 'react-redux';
import { store } from "./redux/store.js";
import { Toaster } from 'react-hot-toast';
import 'sweetalert2/dist/sweetalert2.js';
import { AuthProvider } from './context/AuthContext'; // ✅ import AuthProvide

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <AuthProvider> {/* ✅ Wrap here */}
      <RouterProvider router={router} />
      <Toaster position="top-right" reverseOrder={false} />
    </AuthProvider>
  </Provider>
);

