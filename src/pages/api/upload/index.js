import { uploadBase64Image } from '@/lib/storage-firebase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Get the base64 data and document type from the request body
    const { file, documentType } = req.body;

    if (!file || !file.data) {
      return res.status(400).json({ success: false, message: 'No file data provided' });
    }

    // Create a folder name for Firebase Storage
    const folderName = `imiiza_documents/${documentType.toLowerCase().replace(/\s+/g, '_')}`;
    console.log('Uploading to Firebase Storage folder:', folderName);

    // Upload to Firebase Storage
    const result = await uploadBase64Image(file.data, folderName);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Error uploading file to Firebase Storage',
        error: result.error
      });
    }

    // Return the Firebase Storage response
    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        type: documentType,
        url: result.url,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        uploadDate: new Date(),
        storagePath: result.path,
        contentType: result.contentType
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message,
    });
  }
}
