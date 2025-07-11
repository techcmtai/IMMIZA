import { useState } from 'react';
import { FaUpload, FaTrash, FaPlus } from 'react-icons/fa';

export default function MultiDocumentUploadForm({ 
  requiredDocuments, 
  uploadedDocuments, 
  onSubmit, 
  isUploading, 
  uploadProgress 
}) {
  const [selectedFiles, setSelectedFiles] = useState({});
  const [error, setError] = useState(null);

  // Handle file selection for a specific document type
  const handleFileChange = (e, documentType) => {
    if (e.target.files.length > 0) {
      setSelectedFiles(prev => ({
        ...prev,
        [documentType]: e.target.files[0]
      }));
    }
  };

  // Remove a selected file
  const removeFile = (documentType) => {
    setSelectedFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[documentType];
      return newFiles;
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if any files are selected
    if (Object.keys(selectedFiles).length === 0) {
      setError('Please select at least one file to upload');
      return;
    }

    // Create form data with all files
    const formData = new FormData();
    const documentTypes = [];

    // Add each file to the form data
    Object.entries(selectedFiles).forEach(([docType, file]) => {
      formData.append('files', file);
      documentTypes.push(docType);
    });

    // Add document types as JSON string
    formData.append('documentTypes', JSON.stringify(documentTypes));

    // Call the onSubmit callback with the form data
    onSubmit(formData);
  };

  // Filter out already uploaded documents
  const remainingDocuments = requiredDocuments.filter(
    doc => !uploadedDocuments.includes(doc)
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Required Documents</h3>
        
        {/* Document status summary */}
        <div className="bg-gray-50 p-4 rounded-md mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Document Status:</h4>
          <ul className="space-y-2">
            {requiredDocuments.map((doc, index) => {
              const isUploaded = uploadedDocuments.includes(doc);
              const isSelected = selectedFiles[doc];
              
              return (
                <li key={index} className="flex items-center text-sm">
                  {isUploaded ? (
                    <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : isSelected ? (
                    <svg className="h-5 w-5 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-yellow-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className={`${isUploaded ? 'text-green-600' : isSelected ? 'text-blue-600' : 'text-gray-700'}`}>
                    {doc} {isUploaded ? '(Uploaded)' : isSelected ? '(Selected)' : '(Pending)'}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* File upload sections */}
        {remainingDocuments.length > 0 ? (
          <div className="space-y-4">
            {remainingDocuments.map((docType, index) => (
              <div key={index} className="border rounded-md p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-gray-700">{docType}</h4>
                  {selectedFiles[docType] && (
                    <button
                      type="button"
                      onClick={() => removeFile(docType)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash size={16} />
                    </button>
                  )}
                </div>
                
                {selectedFiles[docType] ? (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="text-sm text-blue-700">
                      Selected: {selectedFiles[docType].name}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-4">
                    <label
                      htmlFor={`file-upload-${index}`}
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                    >
                      <span className="flex items-center">
                        <FaPlus className="mr-2" size={14} />
                        Upload {docType}
                      </span>
                      <input
                        id={`file-upload-${index}`}
                        name={`file-upload-${index}`}
                        type="file"
                        className="sr-only"
                        onChange={(e) => handleFileChange(e, docType)}
                      />
                    </label>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">All required documents have been uploaded!</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${uploadProgress}%` }}
          ></div>
          <p className="text-xs text-gray-500 mt-1 text-right">
            {uploadProgress}% uploaded
          </p>
        </div>
      )}

      {remainingDocuments.length > 0 && Object.keys(selectedFiles).length > 0 && (
        <div>
          <button
            type="submit"
            disabled={isUploading || Object.keys(selectedFiles).length === 0}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              (isUploading || Object.keys(selectedFiles).length === 0) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isUploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <FaUpload className="mr-2" /> Upload {Object.keys(selectedFiles).length} Document{Object.keys(selectedFiles).length > 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      )}
    </form>
  );
}
