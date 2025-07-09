import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { FaPassport, FaCheckCircle, FaExclamationCircle, FaUser } from 'react-icons/fa';
import AgentLayout from '@/components/agent/AgentLayout';
import PendingVerificationView from '@/components/agent/PendingVerificationView';
import RejectedVerificationView from '@/components/agent/RejectedVerificationView';
import { getUserById } from '@/lib/firestore'; // <-- Add this import
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function AgentDashboard() {
  const { user, loading, updateUserData } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [acceptingId, setAcceptingId] = useState(null);
  const [showStartModal, setShowStartModal] = useState(false);

  // Fetch latest user data from Firestore on mount or when user.id changes
  useEffect(() => {
    const refreshUser = async () => {
      if (user && user.id) {
        try {
          const latestUser = await getUserById(user.id);
          if (latestUser) {
            updateUserData(latestUser);
          }
        } catch (err) {
          // Optionally handle error
        }
      }
    };
    refreshUser();
    // eslint-disable-next-line
  }, [user?.id]);

  // Fetch all applications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/applications');
        if (response.data.success) {
          setApplications(response.data.applications || []);
        } else {
          setError(response.data.message || 'Failed to fetch applications');
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
        setError('An error occurred while loading applications. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role === 'agent') {
      fetchApplications();
    } else if (user && user.role !== 'agent') {
      router.push('/');
    }
  }, [user, router]);

  // Accept application
  const handleAcceptApplication = async (applicationId) => {
    try {
      setAcceptingId(applicationId);
      const response = await axios.post('/api/agent/accept-application', {
        applicationId,
        agentId: user.id
      });

      if (response.data.success) {
        // Log the response for debugging
        console.log('Accept application response:', response.data);

        // Update the local state to reflect the change
        setApplications(prevApplications =>
          prevApplications.map(app =>
            app.id === applicationId
              ? {
                  ...app,
                  agentId: user.id,
                  agentName: user.username,
                  agentEmail: user.email,
                  isAccepted: true,
                  acceptedAt: new Date().toISOString()
                }
              : app
          )
        );

        // Update the user object with the new project count using the context method
        const newProjectCount = response.data.projectCount || (user.projectCount || 0) + 1;
        updateUserData({ projectCount: newProjectCount });
      } else {
        setError(response.data.message || 'Failed to accept application');
      }
    } catch (error) {
      console.error('Error accepting application:', error);
      setError('An error occurred while accepting the application. Please try again.');
    } finally {
      setAcceptingId(null);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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

  // Modal component for starting a new application
  const StartApplicationModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl"
          onClick={() => setShowStartModal(false)}
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4">Start New Application</h2>
        {/* Form skeleton - fields will be added next */}
        <form>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Applicant Name</label>
            <input type="text" className="mt-1 p-2 block w-full border rounded-md bg-gray-100" disabled placeholder="(To be implemented)" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" className="mt-1 p-2 block w-full border rounded-md bg-gray-100" disabled placeholder="(To be implemented)" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Destination</label>
            <input type="text" className="mt-1 p-2 block w-full border rounded-md bg-gray-100" disabled placeholder="(To be implemented)" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Visa Type</label>
            <input type="text" className="mt-1 p-2 block w-full border rounded-md bg-gray-100" disabled placeholder="(To be implemented)" />
          </div>
          <button type="button" className="w-full py-2 px-4 bg-rose-500 text-white rounded-md font-semibold opacity-50 cursor-not-allowed" disabled>
            Submit (Coming Soon)
          </button>
        </form>
      </div>
    </div>
  );

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  // Check verification status
  const renderDashboardContent = () => {
    // For existing agents who don't have a verification status, default to 'approved'
    if (!user.verificationStatus) {
      return (
        <>
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Notice:</strong> Your account was created before the verification system was implemented.
                  You have been automatically approved.
                </p>
              </div>
            </div>
          </div>
          {renderApprovedDashboard()}
        </>
      );
    }

    // If user is not verified yet
    if (user.verificationStatus === 'pending') {
      return <PendingVerificationView verificationDate={user.verificationDate} />;
    }

    // If user verification was rejected
    if (user.verificationStatus === 'rejected') {
      return <RejectedVerificationView
        rejectionReason={user.rejectionReason}
        rejectionDate={user.rejectionDate}
      />;
    }

    // If user is verified, show the normal dashboard
    return renderApprovedDashboard();
  };

  // Render the approved dashboard content
  const renderApprovedDashboard = () => {
    return (
      <>
        {/* Start Application Button */}
        <div className="flex justify-end mb-4">
          <button
            className="bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2 px-6 rounded-md shadow"
            onClick={() => router.push('/agent/start-application')}
          >
            + Start Application
          </button>
        </div>
        {showStartModal && <StartApplicationModal />}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Agent Dashboard</h1>
        </div>

        {/* Agent Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg p-6 border-l-4 border-rose-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-rose-100 mr-4">
                <FaUser className="h-6 w-6 text-rose-500" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Accepted Applications</div>
                <div className="mt-1 text-3xl font-semibold text-gray-900">
                  {applications.filter(app => app.agentId === user?.id).length}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <FaPassport className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Available Applications</div>
                <div className="mt-1 text-3xl font-semibold text-gray-900">
                  {applications.filter(app => !app.agentId).length}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <FaCheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Completed Applications</div>
                <div className="mt-1 text-3xl font-semibold text-gray-900">
                  {applications.filter(app => app.agentId === user?.id && app.currentStatus === 'Visa Approved').length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Applications Table */}
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gray-50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div>
              <h2 className="text-lg font-medium text-gray-900">My Applications</h2>
              <p className="mt-1 text-sm text-gray-500">Applications you have accepted</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12">
              <FaExclamationCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
              <p className="mt-1 text-sm text-gray-500">There are no visa applications available at the moment.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Destination
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visa Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications
                    .filter(app => app.userId === (user.id || user.uid))
                    .map((application) => (
                    <tr key={application.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{application.name}</div>
                        <div className="text-sm text-gray-500">{application.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{application.destination?.name || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-500 bg-blue-50 inline-block px-2 py-1 rounded-full">
                          {application.visaType} Visa
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.currentStatus)}`}>
                          {application.currentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(application.submissionDateISO || application.submissionDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {application.agentId ? (
                          application.agentId === user.id ? (
                            <Link
                              href={`/agent/applications/${application.id}`}
                              className="text-rose-600 hover:text-rose-900 mr-4"
                            >
                              Manage
                            </Link>
                          ) : (
                            <span className="text-gray-400">Assigned to another agent</span>
                          )
                        ) : (
                          <button
                            onClick={() => handleAcceptApplication(application.id)}
                            disabled={acceptingId === application.id}
                            className="text-green-600 hover:text-green-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer px-3 py-1 hover:bg-green-50 rounded-md transition-colors"
                          >
                            {acceptingId === application.id ? 'Accepting...' : 'Accept'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <AgentLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
        {renderDashboardContent()}
      </div>
    </AgentLayout>
  );
}