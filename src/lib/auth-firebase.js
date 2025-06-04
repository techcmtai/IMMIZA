import { auth } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { getUserByEmail, createUser } from './firestore';
import jwt from 'jsonwebtoken';
import { getCookie } from 'cookies-next';

// Register a new user
export async function registerUser(email, password, username, phoneNumber) {
  try {
    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update profile with username
    await updateProfile(user, { displayName: username });

    // Create user document in Firestore
    await createUser({
      uid: user.uid,
      username,
      email,
      phoneNumber,
      role: 'user'
    });

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        username,
        phoneNumber,
        role: 'user'
      }
    };
  } catch (error) {
    console.error('Error registering user:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Sign in a user
export async function signIn(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get additional user data from Firestore
    const userData = await getUserByEmail(email);

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        username: userData?.username || user.displayName,
        phoneNumber: userData?.phoneNumber,
        role: userData?.role || 'user'
      }
    };
  } catch (error) {
    console.error('Error signing in:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Sign out a user
export async function signOut() {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Reset password
export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error('Error resetting password:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Get current user
export function getCurrentUser() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        resolve(user);
      },
      reject
    );
  });
}

// Listen to auth state changes
export function onAuthStateChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// Verify JWT token from request
export async function verifyToken(req) {
  // Define both the new and old JWT secrets for backward compatibility
  const JWT_SECRET = process.env.JWT_SECRET || 'immiza-secure-jwt-secret-key-2025';
  const OLD_JWT_SECRET = 'immiza-secure-jwt-secret-key-2023'; // The previous secret

  try {
    // Get token from cookie
    const token = getCookie('token', { req });

    if (!token) {
      console.log('No token found in cookie');
      return null;
    }

    // Make sure token is a string and validate basic JWT format
    const tokenString = String(token);

    // Check for invalid token formats
    if (tokenString === '[object Promise]' || tokenString === '[object Object]') {
      console.error('Invalid token format detected in cookie:', tokenString);
      return null;
    }

    // Basic validation: JWT tokens should have 3 parts separated by dots
    if (!tokenString || !tokenString.includes('.') || tokenString.split('.').length !== 3) {
      console.error('Malformed token format:', tokenString.substring(0, 50) + '...');
      return null;
    }

    console.log('Attempting to verify token with current secret');

    // Try to verify with the current secret
    let decoded;
    try {
      decoded = jwt.verify(tokenString, JWT_SECRET);
      console.log('Token verified with current secret');
    } catch (newSecretError) {
      console.log('Failed to verify with current secret, trying old secret');
      // If that fails, try with the old secret
      try {
        decoded = jwt.verify(tokenString, OLD_JWT_SECRET);
        console.log('Token verified with old secret in verifyToken function');
      } catch (oldSecretError) {
        // If both fail, log and return null
        console.error('Token verification failed with both secrets:', newSecretError);
        return null;
      }
    }

    if (!decoded || !decoded.email) {
      console.error('Decoded token missing email field');
      return null;
    }

    // Verify that the user still exists in the database
    const user = await getUserByEmail(decoded.email);

    if (!user) {
      console.log('User not found in database for email:', decoded.email);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}
