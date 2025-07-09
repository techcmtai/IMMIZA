// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";
import dotenv from "dotenv";

dotenv.config();

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
let app, db, auth, storage;

try {
  console.log("Initializing Firebase app");
  // Check if Firebase app is already initialized
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
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
