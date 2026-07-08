import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCKhp7p_1dLtrLoy336AiXNAskpvrF2pto",
  authDomain: "my-pocket-tracker-d3ce0.firebaseapp.com",
  projectId: "my-pocket-tracker-d3ce0",
  storageBucket: "my-pocket-tracker-d3ce0.firebasestorage.app",
  messagingSenderId: "17697628059",
  appId: "1:17697628059:web:3b0a3c956c050858738b3e",
  measurementId: "G-1S8B6F4HK4"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
