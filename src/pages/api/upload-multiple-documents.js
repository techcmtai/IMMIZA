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
      multiples: true, // Enable multiple file uploads
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // Get application ID from form fields
    const applicationId = fields.applicationId[0];
    
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

    // Get the document types and files
    const documentTypes = JSON.parse(fields.documentTypes[0]);
    const uploadedFiles = files.files;

    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    if (!documentTypes || documentTypes.length !== uploadedFiles.length) {
      return res.status(400).json({ 
        success: false, 
        message: 'Document types must match the number of files' 
      });
    }

    // Process each file
    const uploadResults = [];
    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      const documentType = documentTypes[i];

      // Create a folder path for Firebase Storage
      const folderPath = `imiiza_documents/${documentType.toLowerCase().replace(/\s+/g, '_')}`;

      // Upload the file to Firebase Storage
      const uploadResult = await uploadFile(file, folderPath);

      if (!uploadResult.success) {
        return res.status(500).json({
          success: false,
          message: `Error uploading ${documentType} to Firebase Storage`,
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
      await addDocumentToApplication(applicationId, documentData);

      uploadResults.push(documentData);
    }

    return res.status(200).json({
      success: true,
      message: 'Documents uploaded successfully',
      documents: uploadResults,
    });
  } catch (error) {
    console.error('Error uploading documents:', error);
    return res.status(500).json({
      success: false,
      message: 'Error uploading documents',
      error: error.message,
    });
  }
}
