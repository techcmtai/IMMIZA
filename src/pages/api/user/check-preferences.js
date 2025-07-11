import { getUserById } from '@/lib/firestore';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const { userId } = req.query;

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

    // Check if user has preferences
    const hasPreferences = !!(
      user.preferences && 
      user.preferences.selectedCountry && 
      user.preferences.selectedVisaType
    );

    // Return success response with preferences status
    return res.status(200).json({
      success: true,
      hasPreferences,
      preferences: hasPreferences ? user.preferences : null,
      isNewUser: !!user.isNewUser
    });
  } catch (error) {
    console.error('Error checking user preferences:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking user preferences',
      error: error.message
    });
  }
}
