import { getDocument, updateDocument } from '@/lib/firestore';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { status, note, tentativeDate, requiredDocuments } = req.body;

    if (!id || !status) {
      return res.status(400).json({
        success: false,
        message: 'Application ID and status are required',
      });
    }

    // Get the application
    const application = await getDocument('applications', id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Create new status history entry
    const newStatusEntry = {
      status,
      date: new Date().toISOString(),
      note: note || `Status updated to ${status}`,
      tentativeDate: tentativeDate || null,
    };

    // Add required documents if provided
    if (requiredDocuments && requiredDocuments.length > 0) {
      newStatusEntry.requiredDocuments = requiredDocuments.filter(doc => doc.trim() !== '');
    }

    // Update application with new status and history
    const statusHistory = [...(application.statusHistory || []), newStatusEntry];

    const updatedApplication = await updateDocument('applications', id, {
      currentStatus: status,
      statusHistory,
    });

    return res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      application: updatedApplication,
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
      error: error.message,
    });
  }
}
