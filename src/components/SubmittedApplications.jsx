import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

// Status flow with only 4 main steps
const statusFlow = [
  {
    status: 'Document Submitted',
    message: 'You have submitted the form.',
    daysToAdd: 0,
    color: 'bg-blue-100 text-blue-800',
    step: 1
  },
  {
    status: 'Additional Documents Needed',
    message: 'Additional documents needed.',
    daysToAdd: 4,
    color: 'bg-yellow-100 text-yellow-800',
    step: 2
  },
  {
    status: 'Additional Document Submitted',
    message: 'Additional documents have been submitted.',
    daysToAdd: 1,
    color: 'bg-green-100 text-green-800',
    step: 3
  },
  {
    status: 'Visa Approved',
    message: 'Your visa has been approved!',
    daysToAdd: 0,
    color: 'bg-green-100 text-green-800',
    step: 4
  }
];

export default function SubmittedApplications({ applications: initialApplications }) {
  const router = useRouter();
  const [applications, setApplications] = useState(initialApplications || []);
  const [loading, setLoading] = useState(!initialApplications);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!initialApplications) {
      fetchApplications();
    } else {
      setApplications(initialApplications);
    }
  }, [initialApplications]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/applications');
      if (response.data.success) {
        console.log('Fetched applications:', response.data.applications);

        // Check for requiredDocuments in status history
        response.data.applications.forEach(app => {
          if (app.currentStatus === 'Additional Documents Needed') {
            console.log('Application needs documents:', app.id || app._id);

            // Find status entries with requiredDocuments
            const entriesWithDocs = app.statusHistory.filter(
              entry => entry.status === 'Additional Documents Needed' &&
              entry.requiredDocuments &&
              Array.isArray(entry.requiredDocuments)
            );

            console.log('Status entries with requiredDocuments:', entriesWithDocs);

            if (entriesWithDocs.length > 0) {
              console.log('Latest entry with docs:', entriesWithDocs[entriesWithDocs.length - 1]);
            }
          }
        });

        setApplications(response.data.applications);
      } else {
        setError(response.data.message || 'Failed to load applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError('An error occurred while loading your applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  // Helper function to get status color
  const getStatusColor = (status) => {
    // Map legacy status names to our 4 main statuses
    let mappedStatus = status;
    if (status === 'Additional Documents Submitted') {
      mappedStatus = 'Additional Document Submitted';
    } else if (['Documents Verified', 'Visa Application Submitted', 'Visa Verification In Progress'].includes(status)) {
      // These are intermediate steps, show them as the same color as Additional Document Submitted
      mappedStatus = 'Additional Document Submitted';
    } else if (status === 'Visa Rejected' || status === 'Ticket Closed') {
      // Use a specific color for rejected/closed
      return status === 'Visa Rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800';
    }

    const statusInfo = statusFlow.find(s => s.status === mappedStatus);
    return statusInfo ? statusInfo.color : 'bg-gray-100 text-gray-800';
  };

  // Helper function to get status message
  const getStatusMessage = (status) => {
    // Map legacy status names to our 4 main statuses
    let mappedStatus = status;
    if (status === 'Additional Documents Submitted') {
      mappedStatus = 'Additional Document Submitted';
    } else if (['Documents Verified', 'Visa Application Submitted', 'Visa Verification In Progress'].includes(status)) {
      // For intermediate steps, return the actual status
      return status;
    } else if (status === 'Visa Rejected') {
      return 'Your visa application has been rejected.';
    } else if (status === 'Ticket Closed') {
      return 'This application has been closed.';
    }

    const statusInfo = statusFlow.find(s => s.status === mappedStatus);
    return statusInfo ? statusInfo.message : status;
  };

  // Helper function to format submission date
  const formatSubmissionDate = (firestoreDate) => {
    if (!firestoreDate) return 'N/A';

    // Handle Firestore Timestamp objects
    if (firestoreDate && firestoreDate.seconds) {
      return new Date(firestoreDate.seconds * 1000).toLocaleDateString();
    }

    // Handle ISO strings
    if (typeof firestoreDate === 'string') {
      try {
        return new Date(firestoreDate).toLocaleDateString();
      } catch (error) {
        return 'Invalid Date';
      }
    }

    // Handle Date objects
    if (firestoreDate instanceof Date) {
      return firestoreDate.toLocaleDateString();
    }

    return 'N/A';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
        <p className="text-red-700">{error}</p>
        <button
          onClick={fetchApplications}
          className="mt-2 text-sm text-red-700 underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Submitted Applications</h2>

      {applications?.length > 0 ? (
        <div className="space-y-4">
          {applications.map((application) => (
            <div
              key={application.id || application._id}
              className="bg-white rounded-lg border p-6 shadow-sm"
            >
              <div className="flex flex-col md:flex-row justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{application.name}</h3>
                  <p className="text-gray-600">Application ID: {application.id || application._id}</p>
                  {application.destination && application.visaType && (
                    <p className="text-gray-700 font-medium">
                      {application.visaType} Visa - {application.destination.name}
                    </p>
                  )}
                  <p className="text-gray-600 text-sm">Submitted: {formatSubmissionDate(application.submissionDateISO || application.submissionDate)}</p>
                </div>
                <div className="text-right mt-2 md:mt-0">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.currentStatus)}`}>
                    {application.currentStatus}
                  </span>
                  {/* <p className="text-sm text-gray-500 mt-1">
                    Next Update: {getTentativeDate(application, application.currentStatus)}
                  </p> */}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                {/* Get the latest status entry */}
                {(() => {
                  // Find the latest status entry
                  const latestStatusEntry = application.statusHistory
                    ? [...application.statusHistory].sort((a, b) => {
                        const dateA = a.date && a.date.seconds ? new Date(a.date.seconds * 1000) : new Date(a.date || 0);
                        const dateB = b.date && b.date.seconds ? new Date(b.date.seconds * 1000) : new Date(b.date || 0);
                        return dateB - dateA;
                      })[0]
                    : null;

                 
                })()}

                {application.currentStatus === 'Additional Documents Needed' && (
                  <div className="mb-4">
                    {/* Find the latest status entry with required documents */}
                    {(() => {
                      // First check for multiple documents
                      let latestStatusWithDocs = application.statusHistory
                        .filter(entry =>
                          entry.status === 'Additional Documents Needed' &&
                          entry.requiredDocuments &&
                          Array.isArray(entry.requiredDocuments) &&
                          entry.requiredDocuments.length > 0
                        )
                        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

                     

                      // If we don't find an entry with requiredDocuments array, try to create one from requiredDocument
                      if (!latestStatusWithDocs) {
                        const entryWithSingleDoc = application.statusHistory
                          .filter(entry =>
                            entry.status === 'Additional Documents Needed' &&
                            entry.requiredDocument &&
                            typeof entry.requiredDocument === 'string'
                          )
                          .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

                        if (entryWithSingleDoc) {
                          // Create a copy with requiredDocuments array
                          latestStatusWithDocs = {
                            ...entryWithSingleDoc,
                            requiredDocuments: [entryWithSingleDoc.requiredDocument]
                          };
                          console.log('Created entry with requiredDocuments from requiredDocument:', latestStatusWithDocs);
                        }
                      }

                      // If no multiple documents, check for single document (legacy support)
                      if (!latestStatusWithDocs) {
                        latestStatusWithDocs = application.statusHistory
                          .filter(entry => entry.status === 'Additional Documents Needed' && entry.requiredDocument)
                          .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                      }

                      return (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-3">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              {/* If we have multiple documents */}
                              {latestStatusWithDocs?.requiredDocuments && latestStatusWithDocs.requiredDocuments.length > 0 ? (
                                <div>
                                  <p className="text-sm font-medium text-yellow-700">Required Documents:</p>
                                  <ul className="list-disc pl-5 mt-1">
                                    {Array.isArray(latestStatusWithDocs.requiredDocuments) &&
                                     latestStatusWithDocs.requiredDocuments.map((doc, index) => {
                                      if (!doc) return null; // Skip empty entries

                                      // Check if this document has been uploaded
                                      const isUploaded = application.documents &&
                                        application.documents.some(uploadedDoc =>
                                          uploadedDoc.type === doc ||
                                          uploadedDoc.type.toLowerCase() === doc.toLowerCase()
                                        );

                                      return (
                                        <li key={index} className={`text-sm ${isUploaded ? 'text-green-600' : 'text-yellow-700'}`}>
                                          <a
                                            href={`/dashboard/upload-documents/${application.id || application._id}`}
                                            className="hover:underline flex items-center"
                                          >
                                            {isUploaded ? (
                                              <svg className="inline-block h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                              </svg>
                                            ) : (
                                              <svg className="inline-block h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                              </svg>
                                            )}
                                            {doc} {isUploaded ? '(Uploaded)' : ''}
                                          </a>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>
                              ) : (
                                // Legacy single document support
                                <p className="text-sm text-yellow-700">
                                  <span className="font-medium">Required Document: </span>
                                  <a
                                    href={`/dashboard/upload-documents/${application.id || application._id}`}
                                    className="hover:underline"
                                  >
                                    {latestStatusWithDocs?.requiredDocument || "Additional document needed"}
                                  </a>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                    <button
                      onClick={() => router.push(`/dashboard/upload-documents/${application.id || application._id}`)}
                      className="bg-yellow-500 text-white py-1.5 px-4 rounded-md hover:bg-yellow-600 transition-colors text-sm"
                    >
                      Upload All Required Documents
                    </button>
                  </div>
                )}
                
                <div className="space-y-2">
                  {/* Filter and deduplicate status history entries */}
                  {(() => {
                    // Create a map to store the most recent entry for each status
                    const statusMap = new Map();

                    // Sort status history by date (newest first)
                    const sortedHistory = [...application.statusHistory].sort((a, b) => {
                      const dateA = a.date && a.date.seconds ? new Date(a.date.seconds * 1000) : new Date(a.date || 0);
                      const dateB = b.date && b.date.seconds ? new Date(b.date.seconds * 1000) : new Date(b.date || 0);
                      return dateB - dateA;
                    });

                    // Get the most recent entry for each status
                    sortedHistory.forEach(entry => {
                      if (!statusMap.has(entry.status)) {
                        statusMap.set(entry.status, entry);
                      }
                    });

                    // Convert map values to array
                    const uniqueEntries = Array.from(statusMap.values());

                    // Sort entries according to the status flow order
                    const orderedEntries = uniqueEntries.sort((a, b) => {
                      const indexA = statusFlow.findIndex(s => s.status === a.status);
                      const indexB = statusFlow.findIndex(s => s.status === b.status);
                      return indexA - indexB;
                    });

                    // Organize the timeline to show status steps and notes in between
                    const timeline = [];

                    // First, add all status entries as main steps
                    orderedEntries.forEach((status) => {
                      timeline.push({
                        type: 'status',
                        data: status,
                        date: status.date
                      });
                    });

                    // Now add all notes that are not directly tied to status changes
                    const allNotes = application.statusHistory
                      .filter(entry =>
                        entry.note &&
                        entry.note !== `Status updated to ${entry.status}` &&
                        !entry.note.includes('Status updated to')
                      )
                      .map(entry => ({
                        type: 'note',
                        data: entry,
                        date: entry.date
                      }));

                    // Combine and sort by date
                    const combinedTimeline = [...timeline, ...allNotes].sort((a, b) => {
                      const dateA = a.date && a.date.seconds ? new Date(a.date.seconds * 1000) : new Date(a.date || 0);
                      const dateB = b.date && b.date.seconds ? new Date(b.date.seconds * 1000) : new Date(b.date || 0);
                      return dateB - dateA; // Newest first
                    });

                    // Render the combined timeline
                    return combinedTimeline.map((item, index) => {
                      if (item.type === 'status') {
                        // Render status step
                        return (
                          <div key={`status-${index}`} className="mb-4">
                            <div className="flex items-center">
                              <div className="w-4 h-4 rounded-full bg-[#b76e79] mr-3 flex items-center justify-center">
                                <span className="text-white text-xs font-bold">
                                  {(() => {
                                    // Find the step number for this status
                                    const statusInfo = statusFlow.find(s => s.status === item.data.status);
                                    return statusInfo?.step || statusFlow.findIndex(s => s.status === item.data.status) + 1;
                                  })()}
                                </span>
                              </div>
                              <span className="text-gray-700 font-medium">{item.data.status}</span>
                              <span className="text-gray-500 ml-2 sm:ml-auto text-xs">
                                {formatSubmissionDate(item.data.date)}
                              </span>
                            </div>

                            {/* Show tentative date if available */}
                            {item.data.tentativeDate && (
                              <div className="ml-7 mt-2">
                                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded inline-flex items-center">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                  </svg>
                                  Next update: {formatSubmissionDate(item.data.tentativeDate)}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      } else {
                        // Render note
                        return (
                          <div key={`note-${index}`} className="mb-4 ml-7 relative">
                            <div className="absolute -left-4 top-0 h-full w-px bg-[#b76e79] opacity-30"></div>
                            <div className="absolute -left-4 top-3 w-2 h-2 rounded-full bg-[#b76e79] opacity-50"></div>

                            <div className="p-3 bg-gray-50 rounded-md border-l-4 border-[#b76e79] border-opacity-30">
                              <div className="flex justify-between items-start">
                                <div className="flex items-start">
                                  <svg className="h-4 w-4 text-[#b76e79] mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                  </svg>
                                  <p className="text-sm text-gray-700">{item.data.note}</p>
                                </div>
                                <span className="text-gray-400 text-xs ml-2 flex-shrink-0">
                                  {formatSubmissionDate(item.data.date)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    });
                  })()}
                </div>


              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No applications submitted yet.</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Start Application
          </button>
        </div>
      )}
    </div>
  );
}

