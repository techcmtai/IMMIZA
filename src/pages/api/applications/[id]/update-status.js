import { getDocument, updateDocument } from '@/lib/firestore';
import { uploadBase64Image } from '@/lib/storage-firebase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { status, note, tentativeDate, requiredDocuments, offerLetter } = req.body;

    if (!id || !status) {
      return res.status(400).json({
        success: false,
        message: 'Application ID and status are required',
      });
    }

    let offerLetterUrl = null;
    if (offerLetter && offerLetter.data && offerLetter.filename) {
      const offerLetterPath = `imiiza_documents/offer_letters/${offerLetter.filename}`;
      offerLetterUrl = await uploadBase64Image(offerLetter.data, offerLetterPath);
    }
    console.log("offerLetterUrl", offerLetterUrl);

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
    if (offerLetterUrl) {
      newStatusEntry.offerLetter = offerLetterUrl;
    }

    // Add required documents if provided
    if (requiredDocuments && requiredDocuments.length > 0) {
      newStatusEntry.requiredDocuments = requiredDocuments.filter(doc => doc && doc.trim() !== '');
    }

    // Add offer letter to documents array if uploaded
    let documents = Array.isArray(application.documents) ? [...application.documents] : [];
    if (offerLetterUrl) {
      let docObj = {
        url: (typeof offerLetterUrl === 'string' ? offerLetterUrl : offerLetterUrl.url) || '',
        originalName: offerLetter.filename || '',
        uploadDate: new Date().toISOString(),
        type: 'Offer Letter',
        size: offerLetter.size || offerLetterUrl.size || null,
        storagePath: offerLetterUrl.path || offerLetterUrl.storagePath || '',
        contentType: offerLetterUrl.contentType || offerLetterUrl.mimeType || '',
        mimeType: offerLetterUrl.mimeType || offerLetterUrl.contentType || '',
      };
      // Remove any undefined fields (Firestore does not allow undefined)
      Object.keys(docObj).forEach(key => {
        if (docObj[key] === undefined) {
          docObj[key] = '';
        }
      });
      documents.push(docObj);
    }

    // Update application with new status, history, and documents
    const statusHistory = [...(application.statusHistory || []), newStatusEntry];

    const updatedApplication = await updateDocument('applications', id, {
      currentStatus: status,
      statusHistory,
      documents,
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
