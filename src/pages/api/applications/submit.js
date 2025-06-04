import { createApplication } from '@/lib/firestore';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    // For demo purposes, we'll use a fixed userId
    // const userId = 'user123';

    // Extract form data
    const { name, email, destinationId, destinationName, visaType, documents, userId } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    // Check for userId
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required. Please ensure you are logged in.'
      });
    }

    // Validate destination and visa type
    if (!destinationId || !destinationName || !visaType) {
      return res.status(400).json({
        success: false,
        message: 'Destination and visa type information are required'
      });
    }

    // Validate documents
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one document is required'
      });
    }

    // Log the documents for debugging
    console.log('Documents to be saved:', documents.map(doc => ({
      type: doc.type,
      url: doc.url,
      size: doc.size
    })));

    // Create a new application in Firestore
    const applicationData = {
      userId,
      name,
      email,
      destination: {
        id: destinationId,
        name: destinationName
      },
      visaType,
      documents
    };

    // Save to Firestore
    console.log('Saving application to Firestore:', applicationData);
    const application = await createApplication(applicationData);
    console.log('Application saved successfully with ID:', application.id);

    // Return success response
    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: application.id,
      application
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    return res.status(500).json({
      success: false,
      message: 'Error submitting application',
      error: error.message
    });
  }
}
