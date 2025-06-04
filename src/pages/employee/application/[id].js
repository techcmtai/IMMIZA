import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import {
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaPassport,
  FaCalendarAlt,
  FaFileAlt,
  FaUserTie,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaExclamationTriangle
} from 'react-icons/fa';
import EmployeeLayout from '@/components/employee/EmployeeLayout';

export default function ApplicationDetail() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [application, setApplication] = useState(null);
  const [agent, setAgent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch application details
  useEffect(() => {
    const fetchApplicationDetails = async () => {
      if (!id) return;

      try {
        setIsLoading(true);

        // Fetch application details
        const appResponse = await axios.get(`/api/applications/${id}`);
        if (appResponse.data.success) {
          const appData = appResponse.data.application;
          setApplication(appData);

          // If application has an assigned agent, use the agent info from application data
          if (appData.agentId && appData.agentName && appData.agentEmail) {
            setAgent({
              id: appData.agentId,
              username: appData.agentName,
              email: appData.agentEmail
            });
          }
        } else {
          setError(appResponse.data.message || 'Failed to fetch application details');
        }
      } catch (error) {
        console.error('Error fetching application:', error);
        setError('An error occurred while loading application details.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role === 'employee') {
      fetchApplicationDetails();
    } else if (user && user.role !== 'employee') {
      router.push('/');
    }
  }, [id, user, router]);

  // Format date
  const formatDate = (firestoreDate) => {
    if (!firestoreDate) return 'N/A';

    // Handle Firestore Timestamp objects
    if (firestoreDate && firestoreDate.seconds) {
      return new Date(firestoreDate.seconds * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    // Handle ISO strings
    if (typeof firestoreDate === 'string') {
      return new Date(firestoreDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    // Handle regular Date objects
    if (firestoreDate instanceof Date) {
      return firestoreDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    return 'N/A';
  };

  // Get status icon and color
  const getStatusDisplay = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return {
          icon: <FaCheckCircle className="h-5 w-5 text-green-500" />,
          color: 'bg-green-100 text-green-800',
          text: 'Approved'
        };
      case 'rejected':
        return {
          icon: <FaTimesCircle className="h-5 w-5 text-red-500" />,
          color: 'bg-red-100 text-red-800',
          text: 'Rejected'
        };
      case 'under review':
        return {
          icon: <FaClock className="h-5 w-5 text-blue-500" />,
          color: 'bg-blue-100 text-blue-800',
          text: 'Under Review'
        };
      case 'document submitted':
        return {
          icon: <FaFileAlt className="h-5 w-5 text-yellow-500" />,
          color: 'bg-yellow-100 text-yellow-800',
          text: 'Document Submitted'
        };
      default:
        return {
          icon: <FaExclamationTriangle className="h-5 w-5 text-gray-500" />,
          color: 'bg-gray-100 text-gray-800',
          text: status || 'Pending'
        };
    }
  };

  // Get visa type display name
  const getVisaTypeDisplay = (visaType) => {
    const typeMap = {
      'student': 'Student Visa',
      'tourist': 'Tourist Visa',
      'work': 'Work Visa'
    };
    return typeMap[visaType?.toLowerCase()] || visaType;
  };

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (user.role !== 'employee') {
    return null;
  }

  if (isLoading) {
    return (
      <EmployeeLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
          </div>
        </div>
      </EmployeeLayout>
    );
  }

  if (error || !application) {
    return (
      <EmployeeLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
          <div className="text-center">
            <div className="text-red-600 text-lg font-medium mb-4">
              {error || 'Application not found'}
            </div>
            <button
              onClick={() => router.push('/employee')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700"
            >
              <FaArrowLeft className="mr-2" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </EmployeeLayout>
    );
  }

  const statusDisplay = getStatusDisplay(application.currentStatus);

  return (
    <EmployeeLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/employee')}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FaArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Application Details</h1>
              <p className="text-gray-600">Application ID: {application.id}</p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center">
            {statusDisplay.icon}
            <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${statusDisplay.color}`}>
              {statusDisplay.text}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Application Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Applicant Information */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <FaUser className="mr-2 text-rose-500" />
                  Applicant Information
                </h2>
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Full Name</label>
                    <p className="mt-1 text-sm text-gray-900">{application.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Email</label>
                    <p className="mt-1 text-sm text-gray-900 flex items-center">
                      <FaEnvelope className="mr-2 text-gray-400" />
                      {application.email}
                    </p>
                  </div>

                </div>
              </div>
            </div>

            {/* Visa Information */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <FaPassport className="mr-2 text-rose-500" />
                  Visa Information
                </h2>
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Destination Country</label>
                    <p className="mt-1 text-sm text-gray-900 flex items-center">
                      <FaGlobe className="mr-2 text-gray-400" />
                      {application.destination?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Visa Type</label>
                    <p className="mt-1 text-sm text-gray-900">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {getVisaTypeDisplay(application.visaType)}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Submitted Date</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(application.submissionDateISO || application.submissionDate)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(application.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents */}
            {application.documents && application.documents.length > 0 && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <FaFileAlt className="mr-2 text-rose-500" />
                    Submitted Documents
                  </h2>
                </div>
                <div className="px-6 py-4">
                  <div className="space-y-3">
                    {application.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <FaFileAlt className="mr-3 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{doc.name || `Document ${index + 1}`}</span>
                        </div>
                        {doc.url && (
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-rose-600 hover:text-rose-800 text-sm font-medium"
                          >
                            View
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Assigned Agent */}
            {agent ? (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <FaUserTie className="mr-2 text-rose-500" />
                    Assigned Agent
                  </h2>
                </div>
                <div className="px-6 py-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaUserTie className="h-8 w-8 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">{application.agentName}</h3>
                    <p className="text-sm text-gray-500 flex items-center justify-center mt-1">
                      <FaEnvelope className="mr-1" />
                      {application.agentEmail}
                    </p>

                    <div className="mt-3">
                      <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                        Verified Agent
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <FaUserTie className="mr-2 text-rose-500" />
                    Agent Assignment
                  </h2>
                </div>
                <div className="px-6 py-4 text-center">
                  <div className="text-gray-500">
                    <FaUserTie className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No agent assigned yet</p>
                  </div>
                </div>
              </div>
            )}

            {/* Application Timeline */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <FaClock className="mr-2 text-rose-500" />
                  Application Timeline
                </h2>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-4">
                  {/* Initial submission */}
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-3 h-3 bg-green-500 rounded-full mt-1"></div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">Application Submitted</p>
                      <p className="text-xs text-gray-500">{formatDate(application.submissionDateISO || application.submissionDate)}</p>
                    </div>
                  </div>

                  {/* Status History */}
                  {application.statusHistory && application.statusHistory.length > 0 && (
                    <>
                      {application.statusHistory
                        .sort((a, b) => new Date(a.date) - new Date(b.date))
                        .map((status, index) => {
                          return (
                            <div key={index} className="flex items-start">
                              <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-1 ${
                                status.status.toLowerCase() === 'approved' ? 'bg-green-500' :
                                status.status.toLowerCase() === 'rejected' ? 'bg-red-500' :
                                status.status.toLowerCase() === 'under review' ? 'bg-blue-500' :
                                'bg-yellow-500'
                              }`}></div>
                              <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-gray-900">{status.status}</p>
                                {status.note && (
                                  <p className="text-xs text-gray-600 mt-1">{status.note}</p>
                                )}
                                <p className="text-xs text-gray-500">{formatDate(status.date)}</p>
                                {status.tentativeDate && (
                                  <p className="text-xs text-blue-600 mt-1">
                                    Tentative Date: {formatDate(status.tentativeDate)}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
}
