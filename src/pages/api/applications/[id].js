import { getApplicationById, updateApplicationStatus } from '@/lib/firestore';
import { deleteDocument } from '@/lib/firestore';
import { COLLECTIONS } from '@/lib/firestore';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, message: 'Application ID is required' });
  }

  // GET - Retrieve a specific application
  if (req.method === 'GET') {
    try {
      // For admin/agent views, we don't need to check userId
      const application = await getApplicationById(id);

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      return res.status(200).json({
        success: true,
        application
      });
    } catch (error) {
      console.error('Error fetching application:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching application',
        error: error.message
      });
    }
  }

  // PUT - Update application status
  if (req.method === 'PUT') {
    try {
      const { status, note, tentativeDate, requiredDocuments } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      // Update the application status
      const updatedApplication = await updateApplicationStatus(
        id,
        status,
        note,
        tentativeDate,
        requiredDocuments
      );

      return res.status(200).json({
        success: true,
        message: 'Application status updated successfully',
        application: updatedApplication
      });
    } catch (error) {
      console.error('Error updating application status:', error);
      return res.status(500).json({
        success: false,
        message: 'Error updating application status',
        error: error.message
      });
    }
  }

  // DELETE - Delete application
  if (req.method === 'DELETE') {
    try {
      // Check if application exists
      const application = await getApplicationById(id);
      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }
      await deleteDocument(COLLECTIONS.APPLICATIONS, id);
      return res.status(200).json({
        success: true,
        message: 'Application deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting application:', error);
      return res.status(500).json({
        success: false,
        message: 'Error deleting application',
        error: error.message
      });
    }
  }

  // Other methods not allowed
  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}
