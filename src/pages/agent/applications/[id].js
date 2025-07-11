import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { FaArrowLeft, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import AgentLayout from '@/components/agent/AgentLayout';

export default function AgentApplicationDetail() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { id } = router.query;

  const [application, setApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Status update form
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [tentativeDate, setTentativeDate] = useState('');
  const [requiredDocuments, setRequiredDocuments] = useState(['']);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');

  // Fetch application details
  useEffect(() => {
    const fetchApplication = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const response = await axios.get(`/api/applications/${id}`);

        if (response.data.success) {
          setApplication(response.data.application);
          // Set initial status for the form
          setNewStatus(response.data.application.currentStatus);
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

    if (user && user.role === 'agent' && id) {
      fetchApplication();
    }
  }, [user, id]);

  // Check if the application belongs to this agent
  useEffect(() => {
    if (application && user && application.agentId !== user.id) {
      setError('You do not have permission to view this application');
    }
  }, [application, user]);

  // Handle status update
  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateSuccess(false);
    setUpdateError('');

    try {
      // Filter out empty document requests
      const filteredDocuments = requiredDocuments.filter(doc => doc.trim() !== '');

      const response = await axios.post(`/api/applications/${id}/update-status`, {
        status: newStatus,
        note: statusNote,
        tentativeDate: tentativeDate || null,
        requiredDocuments: filteredDocuments
      });

      if (response.data.success) {
        setApplication(response.data.application);
        setUpdateSuccess(true);
        setStatusNote('');
        setTentativeDate('');
        setRequiredDocuments(['']);
      } else {
        setUpdateError(response.data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setUpdateError('An error occurred while updating the status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Add document request field
  const addDocumentField = () => {
    setRequiredDocuments([...requiredDocuments, '']);
  };

  // Update document request field
  const updateDocumentField = (index, value) => {
    const updatedDocs = [...requiredDocuments];
    updatedDocs[index] = value;
    setRequiredDocuments(updatedDocs);
  };

  // Remove document request field
  const removeDocumentField = (index) => {
    if (requiredDocuments.length > 1) {
      const updatedDocs = [...requiredDocuments];
      updatedDocs.splice(index, 1);
      setRequiredDocuments(updatedDocs);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Document Submitted':
        return 'bg-blue-100 text-blue-800';
      case 'Additional Document Needed':
        return 'bg-yellow-100 text-yellow-800';
      case 'Additional Document Submitted':
        return 'bg-purple-100 text-purple-800';
      case 'Visa Approved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (!user || user.role !== 'agent') {
    router.push('/login');
    return null;
  }

  return (
    <AgentLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 md:mt-20">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Link
              href="/agent"
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <FaArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Application Details</h1>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-6 rounded">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : application ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column - Application Info */}
            <div className="md:col-span-2 space-y-6">
              {/* Application Information */}
              <div className="bg-white shadow overflow-hidden rounded-lg">
                <div className="px-4 py-5 sm:px-6 bg-gray-50">
                  <h2 className="text-lg font-medium text-gray-900">Application Information</h2>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">Details about the visa application.</p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Application ID</dt>
                      <dd className="mt-1 text-sm text-gray-900">{application.id || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Current Status</dt>
                      <dd className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.currentStatus)}`}>
                          {application.currentStatus}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Applicant Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">{application.name || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900">{application.email || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Destination</dt>
                      <dd className="mt-1 text-sm text-gray-900">{application.destination?.name || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Visa Type</dt>
                      <dd className="mt-1 text-sm text-gray-900">{application.visaType || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Submission Date</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {formatDate(application.submissionDateISO || application.submissionDate)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Accepted Date</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {formatDate(application.acceptedAt || 'N/A')}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Documents Section */}
              <div className="bg-white shadow overflow-hidden rounded-lg">
                <div className="px-4 py-5 sm:px-6 bg-gray-50">
                  <h2 className="text-lg font-medium text-gray-900">Submitted Documents</h2>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">Documents uploaded by the applicant.</p>
                </div>
                <div className="border-t border-gray-200">
                  {application.documents && application.documents.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {application.documents.map((doc, index) => (
                        <li key={index} className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{doc.type || `Document ${index + 1}`}</p>
                                <p className="text-sm text-gray-500">{doc.size ? `${(doc.size / 1024 / 1024).toFixed(2)} MB` : 'Size unknown'}</p>
                              </div>
                            </div>
                            <div>
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                              >
                                View
                              </a>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-4 py-5 sm:p-6 text-center">
                      <FaExclamationCircle className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
                      <p className="mt-1 text-sm text-gray-500">No documents have been uploaded yet.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Status History */}
              <div className="bg-white shadow overflow-hidden rounded-lg">
                <div className="px-4 py-5 sm:px-6 bg-gray-50">
                  <h2 className="text-lg font-medium text-gray-900">Status History</h2>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">Timeline of application status changes.</p>
                </div>
                <div className="border-t border-gray-200">
                  {application.statusHistory && application.statusHistory.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {application.statusHistory.map((status, index) => (
                        <li key={index} className="px-4 py-4 sm:px-6">
                          <div className="flex items-start">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 flex items-center">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${getStatusColor(status.status)}`}>
                                  {status.status}
                                </span>
                                <span className="text-gray-500 text-xs">{formatDate(status.date)}</span>
                              </p>
                              {status.note && (
                                <p className="mt-2 text-sm text-gray-500">{status.note}</p>
                              )}
                              {status.tentativeDate && (
                                <p className="mt-1 text-xs text-gray-500">
                                  Tentative date: {formatDate(status.tentativeDate)}
                                </p>
                              )}
                              {status.requiredDocuments && status.requiredDocuments.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs font-medium text-gray-500">Required Documents:</p>
                                  <ul className="mt-1 text-sm text-gray-500 list-disc pl-5">
                                    {status.requiredDocuments.map((doc, docIndex) => (
                                      <li key={docIndex}>{doc}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-4 py-5 sm:p-6 text-center">
                      <p className="text-sm text-gray-500">No status history available.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Status Update */}
            <div className="space-y-6">
              <div className="bg-white shadow overflow-hidden rounded-lg">
                <div className="px-4 py-5 sm:px-6 bg-gray-50">
                  <h2 className="text-lg font-medium text-gray-900">Update Status</h2>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">Change the application status and add notes.</p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  {updateSuccess && (
                    <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center">
                      <FaCheckCircle className="mr-2" />
                      Status updated successfully
                    </div>
                  )}

                  {updateError && (
                    <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                      {updateError}
                    </div>
                  )}

                  <form onSubmit={handleStatusUpdate} className="space-y-4">
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        id="status"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm rounded-md"
                      >
                        <option value="Document Submitted">Document Submitted</option>
                        <option value="Additional Document Needed">Additional Document Needed</option>
                        <option value="Additional Document Submitted">Additional Document Submitted</option>
                        <option value="Visa Approved">Visa Approved</option>
                        <option value="Offer Letter Sent">Offer Letter Sent</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                        Note
                      </label>
                      <textarea
                        id="note"
                        value={statusNote}
                        onChange={(e) => setStatusNote(e.target.value)}
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                        placeholder="Add a note about this status update"
                      />
                    </div>

                    <div>
                      <label htmlFor="tentativeDate" className="block text-sm font-medium text-gray-700">
                        Tentative Date (Optional)
                      </label>
                      <input
                        type="date"
                        id="tentativeDate"
                        value={tentativeDate}
                        onChange={(e) => setTentativeDate(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                      />
                    </div>

                    {newStatus === 'Additional Document Needed' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Required Documents
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                          Specify documents that the applicant needs to provide
                        </p>

                        {requiredDocuments.map((doc, index) => (
                          <div key={index} className="flex items-center mt-2">
                            <input
                              type="text"
                              value={doc}
                              onChange={(e) => updateDocumentField(index, e.target.value)}
                              className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                              placeholder="Document name"
                            />
                            <button
                              type="button"
                              onClick={() => removeDocumentField(index)}
                              className="ml-2 text-gray-400 hover:text-gray-500"
                            >
                              Remove
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={addDocumentField}
                          className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-rose-700 bg-rose-100 hover:bg-rose-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                        >
                          + Add Document
                        </button>
                      </div>
                    )}

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50 cursor-pointer"
                      >
                        {isUpdating ? 'Updating...' : 'Update Status'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <FaExclamationCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Application not found</h3>
            <p className="mt-1 text-sm text-gray-500">The application you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.</p>
            <div className="mt-6">
              <Link
                href="/agent"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
              >
                Go back to dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </AgentLayout>
  );
}