import bcrypt from 'bcrypt';
import { getUserByEmail } from '@/lib/firestore';
import { createToken, setTokenCookie } from '@/lib/token-utils';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Check if user exists in Firestore
    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if password matches
    // Note: In a real implementation, you should use Firebase Auth directly
    // This is a temporary solution until we fully migrate to Firebase Auth
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Create token using the utility function
    const token = createToken(user);

    // Set token in cookie using the utility function
    setTokenCookie(req, res, token);

    // For debugging in production
    console.log('Login successful, token set in cookie');

    // Include verification status for agents
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      projectCount: user.projectCount || 0,
      isNewUser: !!user.isNewUser
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

    // Add user preferences if available
    if (user.preferences) {
      userResponse.preferences = user.preferences;
    }

    res.status(200).json({
      success: true,
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong',
      error: error.message,
    });
  }
}
