import { getCookie, deleteCookie } from 'cookies-next';
import { getUserByEmail } from '@/lib/firestore';
import { verifyToken } from '@/lib/token-utils';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get token from cookie
    const token = getCookie('token', { req, res });

    if (!token) {
      console.log('No token found in cookies');

      // Check if token is in Authorization header as fallback
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const headerToken = authHeader.substring(7);
        console.log('Found token in Authorization header');

        // Verify the token from header using the utility function
        const decoded = verifyToken(headerToken);

        if (!decoded) {
          console.log('Header token verification failed');
          return res.status(401).json({
            success: false,
            message: 'Invalid token in Authorization header',
          });
        }

        console.log('Header token verified successfully');

        // Verify that the user still exists in the database
        const user = await getUserByEmail(decoded.email);

        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'User not found',
          });
        }

        // Include verification status for agents
        const userResponse = {
          id: user.id,
          username: user.username,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          projectCount: user.projectCount || 0,
        };

        // Add verification fields for agents
        if (user.role === 'agent') {
          userResponse.verificationStatus = user.verificationStatus || 'approved';
          userResponse.verificationDate = user.verificationDate || new Date().toISOString();
          userResponse.acceptedApplications = user.acceptedApplications || [];
        }

        // Add specialization fields for employees
        if (user.role === 'employee') {
          userResponse.country = user.country;
          userResponse.visaType = user.visaType;
          userResponse.acceptedApplications = user.acceptedApplications || [];
        }

        return res.status(200).json({
          success: true,
          user: userResponse
        });
      }

      // If we get here, no valid token was found
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    console.log('Token found in cookies, validating...');

    // Use the utility function to verify the token
    const decoded = verifyToken(token);

    if (!decoded) {
      console.log('Token verification failed');
      // Clear the invalid token
      deleteCookie('token', { req, res });
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please log in again.',
      });
    }

    console.log('Token verified successfully');

    // Verify that the user still exists in the database
    const user = await getUserByEmail(decoded.email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    // Include verification status for agents
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      projectCount: user.projectCount || 0,
    };

    // Add verification fields for agents
    if (user.role === 'agent') {
      userResponse.verificationStatus = user.verificationStatus || 'approved'; // Default to approved for existing agents
      userResponse.verificationDate = user.verificationDate || new Date().toISOString();
      userResponse.acceptedApplications = user.acceptedApplications || [];
    }

    // Add specialization fields for employees
    if (user.role === 'employee') {
      userResponse.country = user.country;
      userResponse.visaType = user.visaType;
      userResponse.acceptedApplications = user.acceptedApplications || [];
    }

    res.status(200).json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('Validation error:', error);
    res.status(401).json({
      success: false,
      message: 'Not authenticated',
    });
  }
}
