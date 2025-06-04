import { updateUser, getUserById } from '@/lib/firestore';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const { userId, selectedCountry, selectedCountryName, selectedVisaType } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Check if user exists
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user preferences
    const updatedUser = await updateUser(userId, {
      preferences: {
        selectedCountry,
        selectedCountryName,
        selectedVisaType,
        updatedAt: new Date().toISOString()
      },
      // If this is a new user, set isNewUser to false
      ...(user.isNewUser && { isNewUser: false })
    });

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'User preferences updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating user preferences',
      error: error.message
    });
  }
}
