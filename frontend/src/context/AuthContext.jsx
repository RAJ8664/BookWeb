import React, { createContext, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "../redux/features/auth/authSlice";
import { auth, googleProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut } from "../components/firebaseconfig";
import Swal from "sweetalert2";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../components/firebaseconfig";
import { onAuthStateChanged, updateProfile } from "firebase/auth";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Register a user
  const registerUser = async (email, password) => {
    try {
      return await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  // Login the user
  const loginUser = async (email, password) => {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      return await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google sign-in error:", error);
      throw error;
    }
  };

  // Logout the user
  const logout = async () => {
    try {
      await signOut(auth);
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  // Upload and update profile picture
  const uploadProfilePicture = async (file) => {
    if (!auth.currentUser || !file) {
      throw new Error("User not authenticated or file not provided");
    }
  
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `profile_pictures/${auth.currentUser.uid}/${fileName}`);
  
    try {
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
  
      await updateProfile(auth.currentUser, {
        photoURL: downloadURL,
      });
  
      // Update local state
      setCurrentUser({ ...auth.currentUser });
      
      // Update Redux state
      const { uid, email, displayName, photoURL } = auth.currentUser;
      dispatch(setUser({ uid, email, displayName, photoURL }));
  
      Swal.fire({
        icon: "success",
        title: "Profile Picture Updated 🎉",
        text: "Your new profile picture has been uploaded!",
        confirmButtonColor: "#3b82f6"
      });
  
      return downloadURL;
    } catch (error) {
      console.error("Upload failed:", error);
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: error.message,
      });
      throw error;
    }
  };

  // Update user profile information
  const updateUserProfile = async (profileData) => {
    if (!auth.currentUser) {
      throw new Error("User not authenticated");
    }
    
    try {
      await updateProfile(auth.currentUser, profileData);
      
      // Update the current user state to reflect changes
      setCurrentUser({ ...auth.currentUser });
      
      // Update Redux state
      const { uid, email, displayName, photoURL } = auth.currentUser;
      dispatch(setUser({ uid, email, displayName, photoURL }));
      
      Swal.fire({
        icon: "success",
        title: "Profile Updated",
        text: "Your profile has been successfully updated!",
        confirmButtonColor: "#3b82f6"
      });
      
      return true;
    } catch (error) {
      console.error("Profile update failed:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.message,
      });
      throw error;
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
    uploadProfilePicture,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
