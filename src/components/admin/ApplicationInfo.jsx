import React from 'react';

const ApplicationInfo = ({ application, getStatusColor }) => {
  // Helper function to safely format dates from Firestore
  const formatFirestoreDate = (firestoreDate) => {
    if (!firestoreDate) return 'N/A';

    // Handle Firestore Timestamp objects
    if (firestoreDate && firestoreDate.seconds) {
      return new Date(firestoreDate.seconds * 1000).toLocaleDateString();
    }

    // Handle ISO strings
    if (typeof firestoreDate === 'string') {
      return new Date(firestoreDate).toLocaleDateString();
    }

    // Handle Date objects
    if (firestoreDate instanceof Date) {
      return firestoreDate.toLocaleDateString();
    }

    return 'N/A';
  };

  return (
    <div className="bg-white shadow overflow-hidden rounded-lg">
      <div className="px-4 py-5 sm:px-6 bg-gray-50">
        <h2 className="text-lg font-medium text-gray-900">Application Information</h2>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">Details about the visa application.</p>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
          <div>
            <dt className="text-sm font-medium text-gray-500">Application ID</dt>
            <dd className="mt-1 text-sm text-gray-900">{application.id || application._id || 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Current Status</dt>
            <dd className="mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.currentStatus)}`}>
                {application.currentStatus || 'N/A'}
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
              {formatFirestoreDate(application.submissionDateISO || application.submissionDate)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">User ID</dt>
            <dd className="mt-1 text-sm text-gray-900">{application.userId || 'N/A'}</dd>
          </div>

          {application.agentId && (
            <>
              <div>
                <dt className="text-sm font-medium text-gray-500">Assigned Agent</dt>
                <dd className="mt-1 text-sm text-gray-900">{application.agentName || 'Unknown Agent'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Agent Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{application.agentEmail || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Accepted At</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatFirestoreDate(application.acceptedAt) || 'N/A'}
                </dd>
              </div>
            </>
          )}
        </dl>
      </div>
    </div>
  );
};

export default ApplicationInfo;
