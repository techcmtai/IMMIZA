import { getUsersByRole, getUserByEmail } from '@/lib/firestore';
import { verifyToken } from '@/lib/auth-firebase';
import jwt from 'jsonwebtoken';
import { getCookie } from 'cookies-next';

// Define both the new and old JWT secrets for backward compatibility
const JWT_SECRET = process.env.JWT_SECRET || 'immiza-secure-jwt-secret-key-2025';
const OLD_JWT_SECRET = 'immiza-secure-jwt-secret-key-2023'; // The previous secret

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    let isAuthenticated = false;
    let user = null;

    // First try to verify using the token in the cookie
    try {
      user = await verifyToken(req);
      console.log('Cookie verification result:', user ? 'User found' : 'No user found');

      if (user && user.role === 'admin') {
        console.log('User is admin via cookie, authentication successful');
        isAuthenticated = true;
      }
    } catch (cookieError) {
      console.log('Cookie verification failed:', cookieError.message);
    }

    // If not authenticated yet, check for token in query parameter
    if (!isAuthenticated && req.query.token) {
      try {
        // Ensure we have a proper token string
        let tokenString = req.query.token;

        // Handle case where token might be an array (multiple query params with same name)
        if (Array.isArray(tokenString)) {
          tokenString = tokenString[0];
        }

        // Convert to string and validate it's not a Promise or object
        tokenString = String(tokenString);

        if (tokenString === '[object Promise]' || tokenString === '[object Object]') {
          console.error('Invalid token format detected:', tokenString);
          throw new Error('Invalid token format');
        }

        // Basic validation: JWT tokens should have 3 parts separated by dots
        if (!tokenString || !tokenString.includes('.') || tokenString.split('.').length !== 3) {
          console.error('Malformed query token format:', tokenString.substring(0, 50) + '...');
          throw new Error('Malformed token');
        }

        console.log('Attempting to verify query token');

        // Try to verify with the current secret
        let decoded;
        try {
          decoded = jwt.verify(tokenString, JWT_SECRET);
          console.log('Query token verified with current secret');
        } catch (newSecretError) {
          console.log('Failed to verify query token with current secret, trying old secret');
          // If that fails, try with the old secret
          try {
            decoded = jwt.verify(tokenString, OLD_JWT_SECRET);
            console.log('Query token verified with old secret');
          } catch (oldSecretError) {
            console.error('Query token verification failed with both secrets:', newSecretError);
            throw newSecretError; // If both fail, throw the original error
          }
        }

        if (!decoded || !decoded.email) {
          console.error('Decoded query token missing email field');
          throw new Error('Invalid token payload');
        }

        // Get user from database
        user = await getUserByEmail(decoded.email);

        console.log('Query token user lookup result:', user ? 'User found' : 'No user found');

        if (user && user.role === 'admin') {
          console.log('Query token user is admin, authentication successful');
          isAuthenticated = true;
        }
      } catch (tokenError) {
        console.error('Query token verification error:', tokenError);
      }
    }

    // If still not authenticated, check for token in Authorization header
    if (!isAuthenticated && req.headers.authorization) {
      try {
        // Check if authorization header has the correct format
        if (!req.headers.authorization.startsWith('Bearer ')) {
          console.error('Invalid Authorization header format, missing Bearer prefix');
          throw new Error('Invalid Authorization header format');
        }

        let token = req.headers.authorization.split(' ')[1]; // Extract token from "Bearer <token>"

        if (!token) {
          console.error('Empty token in Authorization header');
          throw new Error('Empty token in Authorization header');
        }

        // Convert to string and validate it's not a Promise or object
        const tokenString = String(token);

        if (tokenString === '[object Promise]' || tokenString === '[object Object]') {
          console.error('Invalid Authorization token format detected:', tokenString);
          throw new Error('Invalid token format');
        }

        // Basic validation: JWT tokens should have 3 parts separated by dots
        if (!tokenString || !tokenString.includes('.') || tokenString.split('.').length !== 3) {
          console.error('Malformed Authorization token format:', tokenString.substring(0, 50) + '...');
          throw new Error('Malformed token');
        }

        console.log('Attempting to verify Authorization token');

        // Try to verify with the current secret
        let decoded;
        try {
          decoded = jwt.verify(tokenString, JWT_SECRET);
          console.log('Authorization token verified with current secret');
        } catch (newSecretError) {
          console.log('Failed to verify Authorization token with current secret, trying old secret');
          // If that fails, try with the old secret
          try {
            decoded = jwt.verify(tokenString, OLD_JWT_SECRET);
            console.log('Authorization token verified with old secret');
          } catch (oldSecretError) {
            console.error('Authorization token verification failed with both secrets:', newSecretError);
            throw newSecretError; // If both fail, throw the original error
          }
        }

        if (!decoded || !decoded.email) {
          console.error('Decoded Authorization token missing email field');
          throw new Error('Invalid token payload');
        }

        // Get user from database
        user = await getUserByEmail(decoded.email);

        console.log('Authorization token user lookup result:', user ? 'User found' : 'No user found');

        if (user && user.role === 'admin') {
          console.log('Authorization token user is admin, authentication successful');
          isAuthenticated = true;
        }
      } catch (headerError) {
        console.error('Authorization header verification error:', headerError);
      }
    }

    // If not authenticated after all checks
    if (!isAuthenticated) {
      console.error('Authentication failed for employees API');
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // If not admin
    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    // Get all employees
    const employees = await getUsersByRole('employee');

    // Process employees to ensure createdAt is properly formatted and group by country
    const processedEmployees = employees.map(employee => {
      // Make a copy of the employee object
      const processedEmployee = { ...employee };

      // If createdAt is a Firestore timestamp (has seconds and nanoseconds)
      if (processedEmployee.createdAt && typeof processedEmployee.createdAt === 'object' && processedEmployee.createdAt.seconds) {
        // Convert to ISO string for consistent handling on the client
        const date = new Date(processedEmployee.createdAt.seconds * 1000);
        processedEmployee.createdAt = date.toISOString();
      }

      return processedEmployee;
    });

    // Group employees by country and visa type
    const groupedEmployees = {};

    console.log('Processing employees for grouping:', processedEmployees.length);

    processedEmployees.forEach(employee => {
      // Normalize country name (capitalize first letter)
      const country = employee.country
        ? employee.country.charAt(0).toUpperCase() + employee.country.slice(1).toLowerCase()
        : 'Unknown';

      // Normalize visa type
      const visaType = employee.visaType ? employee.visaType.toLowerCase() : 'work';

      console.log(`Employee ${employee.username}: country=${country}, visaType=${visaType}`);

      if (!groupedEmployees[country]) {
        groupedEmployees[country] = {
          work: [],
          tourist: [],
          student: [],
          unknown: []
        };
      }

      // Add employee to appropriate visa type category
      if (groupedEmployees[country][visaType]) {
        groupedEmployees[country][visaType].push(employee);
      } else {
        // Handle unknown visa types - put them in unknown category
        console.log(`Unknown visa type ${visaType} for employee ${employee.username}, adding to unknown category`);
        groupedEmployees[country]['unknown'].push(employee);
      }
    });

    console.log('Final grouped employees:', JSON.stringify(groupedEmployees, null, 2));

    return res.status(200).json({
      success: true,
      employees: processedEmployees,
      groupedEmployees,
      totalCount: processedEmployees.length,
      countriesCount: Object.keys(groupedEmployees).length
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
      error: error.message
    });
  }
}
