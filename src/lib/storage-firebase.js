import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

// Upload a file to Firebase Storage
export async function uploadFile(file, folderPath) {
  try {
    // Generate a unique filename
    const fileExtension = file.name ? file.name.split('.').pop() : '';
    const fileName = `${uuidv4()}.${fileExtension}`;
    const fullPath = `${folderPath}/${fileName}`;
    
    // Create a reference to the file location
    const storageRef = ref(storage, fullPath);
    
    // Convert file to Blob if it's a File object
    let fileData = file;
    if (file instanceof File) {
      fileData = file;
    } else if (file.filepath) {
      // For formidable files
      const fs = require('fs');
      fileData = fs.readFileSync(file.filepath);
    }
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, fileData);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      success: true,
      url: downloadURL,
      path: fullPath,
      name: fileName,
      size: file.size || 0,
      type: file.type || file.mimetype || ''
    };
  } catch (error) {
    console.error('Error uploading file to Firebase Storage:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Upload a base64 image to Firebase Storage
export async function uploadBase64Image(base64Data, folderPath, fileName = null) {
  try {
    // Extract the content type and base64 data
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid base64 data');
    }
    
    const contentType = matches[1];
    const base64 = matches[2];
    const byteCharacters = atob(base64);
    const byteArrays = [];
    
    for (let i = 0; i < byteCharacters.length; i += 512) {
      const slice = byteCharacters.slice(i, i + 512);
      const byteNumbers = new Array(slice.length);
      
      for (let j = 0; j < slice.length; j++) {
        byteNumbers[j] = slice.charCodeAt(j);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    
    const blob = new Blob(byteArrays, { type: contentType });
    
    // Generate a unique filename if not provided
    const fileNameToUse = fileName || `${uuidv4()}.${contentType.split('/')[1]}`;
    const fullPath = `${folderPath}/${fileNameToUse}`;
    
    // Create a reference to the file location
    const storageRef = ref(storage, fullPath);
    
    // Upload the blob
    const snapshot = await uploadBytes(storageRef, blob);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      success: true,
      url: downloadURL,
      path: fullPath,
      name: fileNameToUse,
      contentType
    };
  } catch (error) {
    console.error('Error uploading base64 image to Firebase Storage:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
