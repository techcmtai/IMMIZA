import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { FaCheckCircle } from "react-icons/fa"; // Add this import

export default function VisaApplicationForm({ destinationId: propDestinationId, destinationName: propDestinationName, visaType: propVisaType }) {
  const router = useRouter();
  const {
    destinationId: queryDestinationId,
    destinationName: queryDestinationName,
    visaType: queryVisaType,
    documentChecklist: queryDocumentChecklist
  } = router.query;

  // Use props if provided, otherwise fall back to query parameters
  const destinationId = propDestinationId || queryDestinationId;
  const destinationName = propDestinationName || queryDestinationName;
  const visaType = propVisaType || queryVisaType;

  // Parse document checklist from URL parameter
  const [documentChecklist, setDocumentChecklist] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    destinationId: '',
    destinationName: '',
    visaType: '',
    documents: {} // Will hold all document files
  });

  // Parse document checklist when it's available in the URL
  useEffect(() => {
    if (queryDocumentChecklist) {
      try {
        const parsedChecklist = JSON.parse(decodeURIComponent(queryDocumentChecklist));
        if (Array.isArray(parsedChecklist)) {
          setDocumentChecklist(parsedChecklist);
        }
      } catch (error) {
        console.error('Error parsing document checklist:', error);
      }
    }
  }, [queryDocumentChecklist]);

  // Update form data when query parameters change
  useEffect(() => {
    if (destinationId && destinationName && visaType) {
      setFormData(prev => ({
        ...prev,
        destinationId,
        destinationName,
        visaType
      }));
    }
  }, [destinationId, destinationName, visaType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;

    // Update the documents object in formData
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [name]: files[0]
      }
    }));
  };

  // Function to convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Function to upload a file to Cloudinary
  const uploadFile = async (file, documentType) => {
    if (!file) return null;

    try {
      console.log(`Uploading ${documentType}...`);

      // Convert file to base64
      const base64Data = await fileToBase64(file);

      // Prepare the request data
      const requestData = {
        file: {
          name: file.name,
          type: file.type,
          size: file.size,
          data: base64Data
        },
        documentType
      };

      // Make the API request
      const response = await axios.post('/api/upload', requestData);

      // Check if the upload was successful
      if (response.data.success) {
        console.log(`Successfully uploaded ${documentType}:`, response.data.file.url);
        return response.data.file;
      } else {
        console.error(`Failed to upload ${documentType}:`, response.data.message);
        setError(`Failed to upload ${documentType}: ${response.data.message}`);
        return null;
      }
    } catch (error) {
      console.error(`Error uploading ${documentType}:`, error);
      setError(`Error uploading ${documentType}: ${error.message}`);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Upload all files to Firebase Storage
      const uploadedDocuments = [];
      const documentEntries = Object.entries(formData.documents);

      // Check if any documents were selected
      if (documentEntries.length === 0) {
        setError('Please upload at least one document.');
        setIsSubmitting(false);
        return;
      }

      // Upload each document
      for (const [docName, file] of documentEntries) {
        const uploadedDoc = await uploadFile(file, docName);
        if (uploadedDoc) {
          uploadedDocuments.push(uploadedDoc);
        }
      }

      // Check if all documents were uploaded successfully
      if (uploadedDocuments.length !== documentEntries.length) {
        setError('Failed to upload all required documents. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Prepare data for submission
      // Get user from localStorage and parse it to get the ID
      let userId = null;
      if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const userObj = JSON.parse(userStr);
            userId = userObj.id;
            console.log('Retrieved userId from localStorage:', userId);
          } catch (error) {
            console.error('Error parsing user from localStorage:', error);
          }
        }
      }

      const submitData = {
        name: formData.name,
        email: formData.email,
        destinationId: formData.destinationId,
        destinationName: formData.destinationName,
        visaType: formData.visaType,
        documents: uploadedDocuments,
        userId: userId,
      };

      // Submit the data to the API
      const response = await axios.post('/api/applications/submit', submitData);

      if (response.data.success) {
        // Show success message and redirect to dashboard
        alert('Application submitted successfully! Your data has been saved to Firebase with secure image URLs.');
        router.push('/dashboard');
      } else {
        setError(response.data.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setError('An error occurred while submitting your application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-2 text-gray-800">Submit Visa Application</h2>

      {/* Display destination and visa type information if available */}
      {formData.destinationName && formData.visaType && (
        <div className="bg-[#fdf0f2] border-l-4 border-[#b76e79] p-4 mb-6">
          <p className="text-[#b76e79]">
            You are applying for a <strong>{formData.visaType} Visa</strong> to <strong>{formData.destinationName}</strong>
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name
          </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-md focus:ring-[#b76e79] focus:border-[#b76e79]"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-md focus:ring-[#b76e79] focus:border-[#b76e79]"
            disabled={isSubmitting}
          />
        </div>

        {/* Document Checklist Section */}
        <div className="bg-[#fdf0f2] border-l-4 border-[#b76e79] p-4 mb-6">
          <h3 className="text-[#b76e79] font-medium mb-2">Required Documents</h3>
          <p className="text-[#b76e79] text-sm mb-4">
            Please upload all the required documents listed below.
          </p>

          {documentChecklist.length > 0 ? (
            <ul className="list-disc pl-5 text-[#b76e79] text-sm">
            <li>
              If you do not have a document, please <a href="https://wa.me/919053603098" className="text-[#b76e79] underline" target="_blank" rel="noopener noreferrer">contact us</a>.

            </li>
          </ul>

          ) : (
            <p className="text-[#b76e79] text-sm italic">
              No specific documents are required for this visa type.
            </p>
          )}
        </div>

        {/* Dynamic Document Upload Fields */}
        {documentChecklist.length > 0 ? (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-700">Upload Documents</h3>
            {documentChecklist.map((doc, index) => (
              <div key={index} className="border rounded-md p-4 bg-gray-50">
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  {doc}
                  {formData.documents[doc] && (
                    <FaCheckCircle className="text-green-500 inline ml-1" />
                  )}
                </label>
                <input
                  type="file"
                  name={doc}
                  required
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border rounded-md focus:ring-[#b76e79] focus:border-[#b76e79]"
                  disabled={isSubmitting}
                />
                {formData.documents[doc] && (
                  <p className="mt-2 text-sm text-green-600">
                    Selected: {formData.documents[doc].name}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-700">Upload Documents</h3>

            <div className="border rounded-md p-4 bg-gray-50">
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                Passport Photo
                {formData.documents["Passport Photo"] && (
                  <FaCheckCircle className="text-green-500 inline ml-1" />
                )}
              </label>
              <input
                type="file"
                name="Passport Photo"
                required
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border rounded-md focus:ring-[#b76e79] focus:border-[#b76e79]"
                disabled={isSubmitting}
              />
            </div>

            <div className="border rounded-md p-4 bg-gray-50">
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                Passport Front
                {formData.documents["Passport Front"] && (
                  <FaCheckCircle className="text-green-500 inline ml-1" />
                )}
              </label>
              <input
                type="file"
                name="Passport Front"
                required
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border rounded-md focus:ring-[#b76e79] focus:border-[#b76e79]"
                disabled={isSubmitting}
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          className={`w-full bg-[#b76e79] text-white py-2 px-4 rounded-md hover:bg-[#a25c67] transition-colors ${
            isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
}