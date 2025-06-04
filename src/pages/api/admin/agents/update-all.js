import { getUsersByRole, updateUser, getUserByEmail } from '@/lib/firestore';
import { verifyToken } from '@/lib/auth-firebase';
import jwt from 'jsonwebtoken';

// Define both the new and old JWT secrets for backward compatibility
const JWT_SECRET = process.env.JWT_SECRET || 'immiza-secure-jwt-secret-key-2025';
const OLD_JWT_SECRET = 'immiza-secure-jwt-secret-key-2023'; // The previous secret

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    let isAuthenticated = false;
    let user = null;

    // First try to verify using the token in the cookie
    user = await verifyToken(req);

    if (user && user.role === 'admin') {
      isAuthenticated = true;
    }

    // If not authenticated yet, check for token in query parameter
    if (!isAuthenticated && req.query.token) {
      try {
        // Try to verify with the current secret
        let decoded;
        try {
          decoded = jwt.verify(req.query.token, JWT_SECRET);
        } catch (newSecretError) {
          // If that fails, try with the old secret
          try {
            decoded = jwt.verify(req.query.token, OLD_JWT_SECRET);
            console.log('Token verified with old secret');
          } catch (oldSecretError) {
            throw newSecretError; // If both fail, throw the original error
          }
        }

        // Get user from database
        user = await getUserByEmail(decoded.email);

        if (user && user.role === 'admin') {
          isAuthenticated = true;
        }
      } catch (tokenError) {
        console.error('Token verification error:', tokenError);
      }
    }

    // If still not authenticated, check for token in Authorization header
    if (!isAuthenticated && req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1]; // Extract token from "Bearer <token>"

        // Try to verify with the current secret
        let decoded;
        try {
          decoded = jwt.verify(token, JWT_SECRET);
        } catch (newSecretError) {
          // If that fails, try with the old secret
          try {
            decoded = jwt.verify(token, OLD_JWT_SECRET);
            console.log('Token verified with old secret');
          } catch (oldSecretError) {
            throw newSecretError; // If both fail, throw the original error
          }
        }

        // Get user from database
        user = await getUserByEmail(decoded.email);

        if (user && user.role === 'admin') {
          isAuthenticated = true;
        }
      } catch (headerError) {
        console.error('Authorization header verification error:', headerError);
      }
    }

    // If not authenticated after all checks
    if (!isAuthenticated) {
      console.error('Authentication failed for update all agents API');
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // If not admin
    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    // Get all agents
    const agents = await getUsersByRole('agent');

    // Update agents without verification status
    const updatePromises = agents
      .filter(agent => !agent.verificationStatus)
      .map(agent =>
        updateUser(agent.id, {
          verificationStatus: 'approved',
          verificationDate: new Date().toISOString()
        })
      );

    // Wait for all updates to complete
    await Promise.all(updatePromises);

    return res.status(200).json({
      success: true,
      message: `Updated ${updatePromises.length} agents to 'approved' status`
    });
  } catch (error) {
    console.error('Error updating agents:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
      error: error.message
    });
  }
}
