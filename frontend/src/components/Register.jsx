import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { FaGoogle, FaEnvelope, FaLock, FaMobileAlt } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import {
  auth,
  googleProvider,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithPhoneNumber,
} from "./firebaseconfig";

const Register = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const navigate = useNavigate();
  const { registerUser, signInWithGoogle } = useAuth();
  
  // Email Registration
  const onSubmit = async (data) => {
    try {
      await registerUser(data.email, data.password);
      setMessage("Registration successful!");
      const redirectPath = localStorage.getItem("redirectAfterLogin") || "/";
      localStorage.removeItem("redirectAfterLogin");
      navigate(redirectPath);    
    } catch (error) {
      setMessage(error.message);
    }
  };

  // Google Registration
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      setMessage("Google Sign-up successful!");
      const redirectPath = localStorage.getItem("redirectAfterLogin") || "/";
      localStorage.removeItem("redirectAfterLogin");
      navigate(redirectPath);    
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-3xl">
        <div className="px-8 py-10">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
              Create Account
            </h2>
            <p className="text-gray-600">Join our community of readers</p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500" />
                <input
                  {...register("email", { required: true })}
                  type="email"
                  placeholder="Email Address"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="relative group">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500" />
                <input
                  {...register("password", { required: true })}
                  type="password"
                  placeholder="Create Password"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Message Display */}
            {message && (
              <div className={`p-4 rounded-lg ${
                message.includes("success") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              } flex items-center gap-3`}>
                <span>ℹ️</span>
                {message}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl 
                        hover:from-blue-700 hover:to-purple-700 hover:shadow-lg transition-all transform hover:scale-[1.02] cursor-pointer"
            >
              Get Started
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-gray-500 text-sm">Or continue with</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Google Sign-Up */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full py-3.5 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center gap-3 
                      hover:border-blue-300 hover:bg-gray-50 transition-all cursor-pointer"
          >
            <FaGoogle className="text-red-600 text-xl" />
            <span className="font-medium text-gray-700">Google</span>
          </button>

          {/* Existing User Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-purple-600 hover:text-purple-700 transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 text-center">
          <p className="text-xs text-gray-500">
            By registering, you agree to our{" "}
            <Link to="/terms" className="hover:text-blue-600">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
