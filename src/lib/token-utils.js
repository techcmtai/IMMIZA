/**
 * Utility functions for JWT token management
 */
import jwt from 'jsonwebtoken';
import { setCookie, getCookie, deleteCookie } from 'cookies-next';

// Define both the new and old JWT secrets for backward compatibility
const JWT_SECRET = process.env.JWT_SECRET || 'immiza-secure-jwt-secret-key-2025';
const OLD_JWT_SECRET = 'immiza-secure-jwt-secret-key-2023'; // The previous secret

/**
 * Create a JWT token for a user
 * @param {Object} user - The user object
 * @param {Object} options - Options for token creation
 * @returns {string} The JWT token
 */
export function createToken(user, options = {}) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  console.log('Creating token with payload:', {
    ...payload,
    email: payload.email ? `${payload.email.substring(0, 3)}...` : 'none',
  });
  console.log('Using JWT_SECRET:', JWT_SECRET.substring(0, 10) + '...');

  const token = jwt.sign(
    payload,
    JWT_SECRET,
    { expiresIn: options.expiresIn || '30d' }
  );

  console.log('Token created successfully');
  console.log('Token format check:', token.includes('.') ? 'Contains dots' : 'No dots');
  console.log('Token parts:', token.split('.').length);

  return token;
}

/**
 * Set a JWT token in a cookie
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {string} token - The JWT token
 * @param {Object} options - Options for cookie setting
 */
export function setTokenCookie(req, res, token, options = {}) {
  // Make sure token is a string
  const tokenString = String(token);
  
  console.log('Setting cookie with token:', tokenString.substring(0, 20) + '...');
  
  // Set cookie with secure options
  setCookie('token', tokenString, {
    req,
    res,
    maxAge: options.maxAge || 60 * 60 * 24 * 30, // 30 days by default
    path: options.path || '/',
    sameSite: options.sameSite || 'lax',
    httpOnly: options.httpOnly !== false,
    secure: options.secure !== false && process.env.NODE_ENV === 'production',
  });
  
  // Verify the cookie was set correctly
  const cookieCheck = getCookie('token', { req, res });
  console.log('Cookie check after setting:', 
    cookieCheck ? `Found (length: ${String(cookieCheck).length})` : 'Not found');
}

/**
 * Verify a JWT token
 * @param {string} token - The JWT token
 * @returns {Object|null} The decoded token payload or null if invalid
 */
export function verifyToken(token) {
  if (!token) {
    console.log('No token provided');
    return null;
  }

  // Make sure token is a string
  const tokenString = String(token);
  
  // Basic validation: JWT tokens should have 3 parts separated by dots
  if (!tokenString || !tokenString.includes('.') || tokenString.split('.').length !== 3) {
    console.error('Malformed token format:', tokenString.substring(0, 10) + '...');
    return null;
  }
  
  console.log('Token format valid, verifying signature...');
  
  // Try to verify with the current secret
  try {
    console.log('Attempting to verify with current secret');
    const decoded = jwt.verify(tokenString, JWT_SECRET);
    console.log('Token verified with current secret');
    return decoded;
  } catch (newSecretError) {
    console.log('Failed to verify with current secret:', newSecretError.message);
    
    // If that fails, try with the old secret
    try {
      console.log('Attempting to verify with old secret');
      const decoded = jwt.verify(tokenString, OLD_JWT_SECRET);
      console.log('Token verified with old secret');
      return decoded;
    } catch (oldSecretError) {
      console.log('Failed to verify with old secret:', oldSecretError.message);
      return null;
    }
  }
}

/**
 * Clear the token cookie
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
export function clearTokenCookie(req, res) {
  console.log('Clearing token cookie');
  deleteCookie('token', { req, res });
}
