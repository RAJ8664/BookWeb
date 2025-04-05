// src/components/firebaseconfig.jsx

import { initializeApp } from "firebase/app";


import { getAnalytics } from "firebase/analytics";

import { getStorage } from "firebase/storage";

import { 
  getAuth, 
  GoogleAuthProvider,  
  signInWithPhoneNumber, 
  signInWithPopup, 
  sendPasswordResetEmail, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword 
} from "firebase/auth";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA48GTPdtSwBn9oHazxGJjAym_eyM8VPu8",
  authDomain: "bookweb-a1b39.firebaseapp.com",
  projectId: "bookweb-a1b39",
  storageBucket: "bookweb-a1b39.firebasestorage.app",
  messagingSenderId: "481646674048",
  appId: "1:481646674048:web:b282e3b06178af9531e665",
  measurementId: "G-R9SELTK64T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { 
  auth, 
  googleProvider, 
  signInWithPhoneNumber, 
  signInWithPopup, 
  sendPasswordResetEmail, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword 
};

export const storage = getStorage(app);
