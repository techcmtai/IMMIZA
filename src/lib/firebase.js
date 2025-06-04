// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDKSE1rWpOgyDyAaAIwYnslXpHi1ZeuoAE",
  authDomain: "immiza-portal.firebaseapp.com",
  databaseURL: "https://immiza-portal-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "immiza-portal",
  storageBucket: "immiza-portal.firebasestorage.app",
  messagingSenderId: "191358096605",
  appId: "1:191358096605:web:e37fd52c4ed824f0ddf734",
  measurementId: "G-G56PYJB0EX"
};

// Initialize Firebase
let app, db, auth, storage;

try {
  console.log("Initializing Firebase app");
  app = initializeApp(firebaseConfig);
  console.log("Firebase app initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase app:", error);
  throw error;
}

try {
  console.log("Initializing Firestore");
  db = getFirestore(app);
  console.log("Firestore initialized successfully");
} catch (error) {
  console.error("Error initializing Firestore:", error);
  db = null;
}

try {
  console.log("Initializing Auth");
  auth = getAuth(app);
  console.log("Auth initialized successfully");
} catch (error) {
  console.error("Error initializing Auth:", error);
  auth = null;
}

try {
  console.log("Initializing Storage");
  storage = getStorage(app);
  console.log("Storage initialized successfully");
} catch (error) {
  console.error("Error initializing Storage:", error);
  storage = null;
}

// Initialize Analytics - only in browser environment
let analytics = null;
if (typeof window !== 'undefined') {
  // Check if analytics is supported
  isSupported().then(yes => yes && (analytics = getAnalytics(app)));
}

export { db, auth, storage, analytics };
export default app;
