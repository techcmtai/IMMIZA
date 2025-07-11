import { IncomingForm } from 'formidable';
import { uploadFile } from '@/lib/storage-firebase';
import { addDocumentToApplication, getApplicationById } from '@/lib/firestore';

// Disable the default body parser to handle form data
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Parse form with formidable
    const form = new IncomingForm({
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // Get application ID and document type from form fields
    const applicationId = fields.applicationId[0];
    const documentType = fields.documentType[0];

    if (!applicationId) {
      return res.status(400).json({ success: false, message: 'Application ID is required' });
    }

    // Find the application
    const application = await getApplicationById(applicationId);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Check if application status is "Additional Documents Needed"
    if (application.currentStatus !== 'Additional Documents Needed') {
      return res.status(400).json({
        success: false,
        message: 'This application does not require additional documents',
      });
    }

    // Get the uploaded file
    const file = files.file[0];
    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Create a folder path for Firebase Storage
    const folderPath = `imiiza_documents/${documentType.toLowerCase().replace(/\s+/g, '_')}`;

    // Upload the file to Firebase Storage
    const uploadResult = await uploadFile(file, folderPath);

    if (!uploadResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Error uploading to Firebase Storage',
        error: uploadResult.error
      });
    }

    // Create document data
    const documentData = {
      type: documentType,
      url: uploadResult.url,
      originalName: file.originalFilename,
      mimeType: file.mimetype,
      size: file.size,
      uploadDate: new Date().toISOString(),
      storagePath: uploadResult.path
    };

    // Add the document to the application
    const updatedApplication = await addDocumentToApplication(applicationId, documentData);

    return res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      document: documentData,
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    return res.status(500).json({
      success: false,
      message: 'Error uploading document',
      error: error.message,
    });
  }
}
