import { initializeApp } from "firebase/app";

import { getStorage } from "firebase/storage";

import { 
  getAuth, 
  GoogleAuthProvider,  
  signInWithPhoneNumber, 
  signInWithPopup, 
  sendPasswordResetEmail, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { 
  auth, 
  googleProvider, 
  signInWithPhoneNumber, 
  signInWithPopup, 
  sendPasswordResetEmail, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
};

export const storage = getStorage(app);
