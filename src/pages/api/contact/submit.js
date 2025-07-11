import { createContact } from '@/lib/firestore';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const { phoneNumber } = req.body;

    // Validate phone number
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    // Create a new contact entry
    const contact = await createContact({
      phoneNumber,
      status: 'new',
      notes: ''
    });

    // Return success response
    return res.status(201).json({
      success: true,
      message: 'Contact information submitted successfully',
      data: contact
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
      error: error.message,
    });
  }
}
