import { getDocuments, updateDocument, COLLECTIONS } from '@/lib/firestore';
import { where } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required',
      });
    }

    // Find the user
    const users = await getDocuments(COLLECTIONS.USERS, [
      where('username', '==', username)
    ]);

    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = users[0];

    // Update the user's role to admin
    const updatedUser = await updateDocument(COLLECTIONS.USERS, user.id, {
      role: 'admin'
    });

    res.status(200).json({
      success: true,
      message: `User ${username} is now an admin`,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error('Make admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong',
      error: error.message,
    });
  }
}
