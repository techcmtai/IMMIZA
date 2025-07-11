import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import Link from 'next/link';
import { FaArrowLeft, FaUpload, FaFileAlt, FaExclamationTriangle } from 'react-icons/fa';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import MultiDocumentUploadForm from '@/components/MultiDocumentUploadForm';

export default function UploadDocuments() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const { id } = router.query;

  const [application, setApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [requiredDocuments, setRequiredDocuments] = useState([]);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Fetch application details
  useEffect(() => {
    const fetchApplication = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const response = await axios.get(`/api/applications/${id}`);

        if (response.data.success) {
          const application = response.data.application;
          setApplication(application);

          // Get already uploaded document types
          const uploadedDocTypes = application.documents.map(doc => doc.type);
          setUploadedDocuments(uploadedDocTypes);

          // First check for multiple documents
          let latestStatusWithDocs = application.statusHistory
            .filter(entry => entry.status === 'Additional Documents Needed' && entry.requiredDocuments && entry.requiredDocuments.length > 0)
            .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

          if (latestStatusWithDocs?.requiredDocuments) {
            setRequiredDocuments(latestStatusWithDocs.requiredDocuments);
          } else {
            // Legacy support for single document
            const latestStatusWithDoc = application.statusHistory
              .filter(entry => entry.status === 'Additional Documents Needed' && entry.requiredDocument)
              .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

            if (latestStatusWithDoc?.requiredDocument) {
              setRequiredDocuments([latestStatusWithDoc.requiredDocument]);
            }
          }
        } else {
          setError(response.data.message || 'Failed to fetch application details');
        }
      } catch (error) {
        console.error('Error fetching application:', error);
        setError('An error occurred while loading the application. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchApplication();
    }
  }, [id]);



  // Handle multiple file upload
  const handleMultipleUpload = async (formData) => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    // Add application ID to form data
    formData.append('applicationId', id);

    try {
      const response = await axios.post('/api/upload-multiple-documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      if (response.data.success) {
        setUploadSuccess(true);
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to upload documents');
      }
    } catch (error) {
      console.error('Error uploading documents:', error);
      setError('An error occurred while uploading the documents. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <LoadingSpinner size="large" color="blue" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 pt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <FaArrowLeft className="mr-2" /> Back to Dashboard
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Upload Required Documents</h1>
            <p className="mt-1 text-sm text-gray-500">
              Upload all documents requested by the visa processing team
            </p>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner color="blue" />
              </div>
            ) : error ? (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FaExclamationTriangle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {application && application.currentStatus !== 'Additional Documents Needed' ? (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          No additional documents are currently required for this application.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <FaFileAlt className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="ml-3 w-full">
                          <p className="text-sm font-medium text-blue-700 mb-2">
                            Required Documents:
                          </p>
                          <ul className="text-sm space-y-1 mt-2">
                            {requiredDocuments.map((doc, index) => {
                              const isUploaded = uploadedDocuments.includes(doc);
                              return (
                                <li key={index} className={`flex items-center ${isUploaded ? 'text-green-600' : 'text-blue-700'}`}>
                                  {isUploaded ? (
                                    <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                  ) : (
                                    <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                  {doc} {isUploaded ? '(Uploaded)' : '(Required)'}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {uploadSuccess ? (
                      <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-green-700">Documents uploaded successfully! Redirecting to dashboard...</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Required Documents</h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Upload all your required documents at once using the form below.
                        </p>

                        <MultiDocumentUploadForm
                          requiredDocuments={requiredDocuments}
                          uploadedDocuments={uploadedDocuments}
                          onSubmit={handleMultipleUpload}
                          isUploading={isUploading}
                          uploadProgress={uploadProgress}
                        />
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
