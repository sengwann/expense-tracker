// Import necessary Firebase functions
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB5gRPGBH-pFVGvOosM4qtsIxftfxvLR-w",
  authDomain: "expense-tracker-f9299.firebaseapp.com",
  projectId: "expense-tracker-f9299",
  storageBucket: "expense-tracker-f9299.firebasestorage.app",
  messagingSenderId: "875382178539",
  appId: "1:875382178539:web:7d2fb82ff10bb91846f4ae",
  measurementId: "G-YB9GTXQX0R",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Analytics and Auth
export const auth = getAuth(app); // Export auth instance
export const db = getFirestore(app);
