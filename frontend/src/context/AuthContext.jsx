import React, { createContext, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "../redux/features/auth/authSlice";
import { auth, googleProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut } from "../components/firebaseconfig";
import Swal from "sweetalert2";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../components/firebaseconfig";
import { onAuthStateChanged, updateProfile, updateEmail } from "firebase/auth";

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
      const result = await createUserWithEmailAndPassword(auth, email, password);
      Swal.fire({
        icon: "success",
        title: "Registration Successful",
        text: "Your account has been created successfully!",
        confirmButtonColor: "#3b82f6"
      });
      return result;
    } catch (error) {
      console.error("Registration error:", error);
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: error.message,
        confirmButtonColor: "#3b82f6"
      });
      throw error;
    }
  };

  // Login the user
  const loginUser = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: "Welcome back!",
        confirmButtonColor: "#3b82f6",
        timer: 1500,
        showConfirmButton: false
      });
      return result;
    } catch (error) {
      console.error("Login error:", error);
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: error.message,
        confirmButtonColor: "#3b82f6"
      });
      throw error;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      Swal.fire({
        icon: "success",
        title: "Google Sign-in Successful",
        text: "You've been signed in with Google!",
        confirmButtonColor: "#3b82f6",
        timer: 1500,
        showConfirmButton: false
      });
      return result;
    } catch (error) {
      console.error("Google sign-in error:", error);
      Swal.fire({
        icon: "error",
        title: "Google Sign-in Failed",
        text: error.message,
        confirmButtonColor: "#3b82f6"
      });
      throw error;
    }
  };

  // Logout the user
  const logout = async () => {
    try {
      await signOut(auth);
      Swal.fire({
        icon: "success",
        title: "Logged Out",
        text: "You have been successfully logged out!",
        confirmButtonColor: "#3b82f6",
        timer: 1500,
        showConfirmButton: false
      });
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      Swal.fire({
        icon: "error",
        title: "Logout Failed",
        text: error.message,
        confirmButtonColor: "#3b82f6"
      });
      throw error;
    }
  };

  // Upload and update profile picture
  const uploadProfilePicture = async (file) => {
    if (!auth.currentUser || !file) {
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: "User not authenticated or file not provided",
        confirmButtonColor: "#3b82f6"
      });
      throw new Error("User not authenticated or file not provided");
    }
  
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `profile_pictures/${auth.currentUser.uid}/${fileName}`);
  
    try {
      Swal.fire({
        title: "Uploading...",
        text: "Please wait while we upload your profile picture",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
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
        confirmButtonColor: "#3b82f6"
      });
      throw error;
    }
  };

  // Update user profile information
  const updateUserProfile = async (profileData) => {
    if (!auth.currentUser) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "User not authenticated",
        confirmButtonColor: "#3b82f6"
      });
      throw new Error("User not authenticated");
    }
    
    try {
      Swal.fire({
        title: "Updating Profile...",
        text: "Please wait while we update your profile",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      // Extract email from profileData, if it exists
      const { email, ...otherProfileData } = profileData;
      
      // Update profile data
      await updateProfile(auth.currentUser, otherProfileData);
      
      // Update email if provided and different from current
      if (email && email !== auth.currentUser.email) {
        try {
          await updateEmail(auth.currentUser, email);
        } catch (emailError) {
          // If email update fails, still continue with other updates
          console.error("Email update failed:", emailError);
          Swal.fire({
            icon: "warning",
            title: "Email Update Failed",
            text: "Profile updated successfully, but email could not be changed. You may need to re-login before changing email.",
            confirmButtonColor: "#3b82f6"
          });
          return true;
        }
      }
      
      // Update the current user state to reflect changes
      setCurrentUser({ ...auth.currentUser });
      
      // Update Redux state
      const { uid, email: currentEmail, displayName, photoURL } = auth.currentUser;
      dispatch(setUser({ uid, email: currentEmail, displayName, photoURL }));
      
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
        confirmButtonColor: "#3b82f6"
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
