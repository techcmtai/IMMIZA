import { getUserById } from '@/lib/firestore';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    // Get user from database
    const user = await getUserById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Remove sensitive information
    const { password, ...userWithoutPassword } = user;

    // Process user to ensure createdAt is properly formatted
    const processedUser = { ...userWithoutPassword };

    // If createdAt is a Firestore timestamp (has seconds and nanoseconds)
    if (processedUser.createdAt && typeof processedUser.createdAt === 'object' && processedUser.createdAt.seconds) {
      // Convert to ISO string for consistent handling on the client
      const date = new Date(processedUser.createdAt.seconds * 1000);
      processedUser.createdAt = date.toISOString();
    }

    return res.status(200).json({
      success: true,
      user: processedUser
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
      error: error.message
    });
  }
}
