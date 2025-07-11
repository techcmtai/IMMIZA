/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: "AIzaSyDKSE1rWpOgyDyAaAIwYnslXpHi1ZeuoAE",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "immiza-portal.firebaseapp.com",
    NEXT_PUBLIC_FIREBASE_DATABASE_URL: "https://immiza-portal-default-rtdb.asia-southeast1.firebasedatabase.app",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: "immiza-portal",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "immiza-portal.firebasestorage.app",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "191358096605",
    NEXT_PUBLIC_FIREBASE_APP_ID: "1:191358096605:web:e37fd52c4ed824f0ddf734",
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: "G-G56PYJB0EX"
  }
};

export default nextConfig;
