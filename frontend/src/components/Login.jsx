import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGoogle, FaEnvelope, FaLock, FaShieldAlt } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import {
  auth,
  googleProvider,
  signInWithPhoneNumber,
  signInWithPopup,
  sendPasswordResetEmail,
} from "./firebaseconfig";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence,
  RecaptchaVerifier,
} from "firebase/auth";

const Login = () => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [showPhoneLogin, setShowPhoneLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { loginUser, signInWithGoogle } = useAuth();

  useEffect(() => {
    const savedEmail = localStorage.getItem("userEmail");
    if (savedEmail) {
      setValue("email", savedEmail);
      setRememberMe(true);
    }
  }, [setValue]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistenceType);
      
      await loginUser(data.email, data.password);

      if (rememberMe) {
        localStorage.setItem("userEmail", data.email);
      } else {
        localStorage.removeItem("userEmail");
      }

      setMessage("Login successful!");
      const redirectPath = localStorage.getItem("redirectAfterLogin") || "/";
      localStorage.removeItem("redirectAfterLogin");
      navigate(redirectPath);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistenceType);
      
      await signInWithGoogle();
      
      setMessage("Google login successful!");

      const redirectPath = localStorage.getItem("redirectAfterLogin") || "/";
      localStorage.removeItem("redirectAfterLogin");
      navigate(redirectPath);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => handleSendOTP(),
        "expired-callback": () => setMessage("Recaptcha expired. Please try again."),
      });
    }
  };

  const handleSendOTP = async () => {
    setLoading(true);
    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const fullPhone = `+977${phone}`;
      const confirmation = await signInWithPhoneNumber(auth, fullPhone, appVerifier);
      setConfirmationResult(confirmation);
      setMessage("OTP sent successfully!");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    try {
      if (!confirmationResult) return setMessage("No OTP sent yet.");
      await confirmationResult.confirm(otp);
      setMessage("Phone login successful!");

      const redirectPath = localStorage.getItem("redirectAfterLogin") || "/";
      localStorage.removeItem("redirectAfterLogin");
      navigate(redirectPath);
    } catch (error) {
      setMessage("Invalid OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden transition-all">
        <div className="px-8 py-10">
          <h2 className="text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            BookWeb Login
          </h2>

          {!showPhoneLogin ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register("email", { required: true })}
                    type="email"
                    placeholder="Email"
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.email && <p className="text-sm text-red-500 mt-1">Email is required</p>}
                </div>

                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register("password", { required: true })}
                    type="password"
                    placeholder="Password"
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.password && <p className="text-sm text-red-500 mt-1">Password is required</p>}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="mr-2"
                  />
                  <label htmlFor="rememberMe" className="text-gray-600">
                    Remember Me
                  </label>
                </div>
              </div>

              {message && (
                <div className={`p-3 rounded-lg ${message.includes("success") ? "bg-green-100" : "bg-red-100"}`}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-md"
                disabled={loading}
              >
                {loading ? "Loading..." : "Login"}
              </button>
            </form>
          ) : (
            <>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">+977</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="Phone number"
                  className="w-full pl-16 pr-4 py-3 border rounded-lg"
                  maxLength={10}
                />
              </div>

              <button
                onClick={handleSendOTP}
                className="w-full py-3 mt-2 bg-purple-100 text-purple-600 rounded-lg cursor-pointer"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>

              <div className="relative mt-4">
                <FaShieldAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  className="w-full pl-10 pr-4 py-3 border rounded-lg"
                />
              </div>

              <button
                onClick={handleVerifyOTP}
                className="w-full py-3 mt-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg cursor-pointer"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              {message && (
                <div className={`mt-3 p-3 rounded-lg ${message.includes("success") ? "bg-green-100" : "bg-red-100"}`}>
                  {message}
                </div>
              )}
            </>
          )}

          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 border-t"></div>
            <span className="text-gray-500">Or</span>
            <div className="flex-1 border-t"></div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="w-full py-3 bg-white border rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 cursor-pointer"
          >
            <FaGoogle className="text-red-600" /> Continue with Google
          </button>

          <button
            onClick={() => setShowPhoneLogin(!showPhoneLogin)}
            className="w-full py-3 mt-2 bg-white border rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 cursor-pointer"
          >
            {showPhoneLogin ? "Login using Email and Password" : "Login using Phone"}
          </button>

          <div className="mt-6 text-center">
            <p>
              Don&apos;t have an account?{" "}
              <Link to="/register" className="text-purple-600 hover:text-purple-700">
                Register
              </Link>
            </p>
          </div>

          {/* 🔐 Invisible Recaptcha container */}
          <div id="recaptcha-container"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
