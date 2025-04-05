import React, { createContext, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "../redux/features/auth/authSlice";
import { auth, } from "../components/firebaseconfig";
import Swal from "sweetalert2";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../components/firebaseconfig";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from "firebase/auth";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const googleProvider = new GoogleAuthProvider();

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Register a user
  const registerUser = async (email, password) => {
    return await createUserWithEmailAndPassword(auth, email, password);
  };

  // Login the user
  const loginUser = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    return await signInWithPopup(auth, googleProvider);
  };

  // Logout the user
  const logout = () => {
    return signOut(auth);
  };

  // Update user profile (displayName, photoURL)
  const uploadProfilePicture = async (file) => {
    if (!auth.currentUser || !file) return;
  
    const storageRef = ref(storage, `profile_pictures/${auth.currentUser.uid}/${file.name}`);
  
    try {
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
  
      await updateProfile(auth.currentUser, {
        photoURL: downloadURL,
      });
  
      setCurrentUser({ ...auth.currentUser }); // force re-render if needed
  
      Swal.fire({
        icon: "success",
        title: "Profile Picture Updated 🎉",
        text: "Your new profile picture has been uploaded!",
        confirmButtonColor: "#3b82f6"  // Tailwind's blue-500
      });
  
      return downloadURL;
    } catch (error) {
      console.error("Upload failed:", error);
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: error.message,
      });
    }
  };

  // Auth state observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);

      if (user) {
        const { uid, email, displayName, photoURL } = user;
        dispatch(setUser({ uid, email, displayName, photoURL }));
      } else {
        dispatch(clearUser());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  const value = {
    user: currentUser,
    loading,
    registerUser,
    loginUser,
    logout,
    signInWithGoogle,
    uploadProfilePicture, // ✅ include this
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
