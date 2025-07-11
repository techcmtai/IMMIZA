import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { FaUser, FaEnvelope, FaCalendarAlt, FaCheck, FaTimes, FaUserCog, FaPhone, FaHourglass } from 'react-icons/fa';
import axios from 'axios';
import SalesLayout from '@/components/sales/SalesLayout';

export default function AgentManagement() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'approved', 'rejected'
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [isUpdatingAll, setIsUpdatingAll] = useState(false);

  // Fetch all agents
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching agents, user:', user ? `${user.username} (${user.role})` : 'No user');

        // Get token from localStorage as a fallback
        let authToken = '';
        if (typeof window !== 'undefined') {
          const userData = localStorage.getItem('user');
          if (userData) {
            try {
              const parsedUser = JSON.parse(userData);
              if (parsedUser && parsedUser.token) {
                // Ensure token is a string and not a Promise or object
                authToken = String(parsedUser.token);

                // Validate token format
                if (authToken === '[object Promise]' || authToken === '[object Object]' || authToken === 'undefined' || authToken === 'null') {
                  console.error('Invalid token format in localStorage:', authToken);
                  authToken = '';
                }
              }
            } catch (parseError) {
              console.error('Error parsing user data from localStorage:', parseError);
            }
          }
        }

        // Use token in query parameter for reliable authentication
        const url = authToken
          ? `/api/admin/agents?token=${encodeURIComponent(authToken)}`
          : '/api/admin/agents';

        console.log('Fetching agents with URL:', url.includes('token=') ? 'URL with token' : 'URL without token');

        const response = await axios.get(url, {
          headers: {
            'Cache-Control': 'no-cache',
            // Include token in Authorization header as a fallback
            ...(authToken && { 'Authorization': `Bearer ${authToken}` })
          },
          withCredentials: true // Include cookies in the request
        });

        if (response.data.success) {
          const agentsList = response.data.agents || [];

          // Debug log for createdAt values
          agentsList.forEach(agent => {
            console.log(`Agent ${agent.username} createdAt:`, agent.createdAt);
          });

          setAgents(agentsList);
        } else {
          setError(response.data.message || 'Failed to fetch agents');
        }
      } catch (error) {
        console.error('Error fetching agents:', error);
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Server error response:', error.response.data);
          setError(`Server error: ${error.response.data.message || error.response.statusText}`);
        } else if (error.request) {
          // The request was made but no response was received
          console.error('No response received:', error.request);
          setError('No response from server. Please check your connection.');
        } else {
          // Something happened in setting up the request that triggered an Error
          setError(`Request error: ${error.message}`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchAgents();
    } else if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  // Format date - handles both Firestore timestamps and ISO strings
  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';

    let date;

    // Check if it's a Firestore timestamp (has seconds and nanoseconds)
    if (dateValue && typeof dateValue === 'object' && dateValue.seconds !== undefined) {
      // Convert Firestore timestamp to JavaScript Date
      date = new Date(dateValue.seconds * 1000);
    } else {
      // Handle ISO string or other date format
      date = new Date(dateValue);
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.log('Invalid date:', dateValue);
      return 'Invalid Date';
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Approve agent
  const approveAgent = async (agentId) => {
    try {
      setProcessingId(agentId);

      // Get token from localStorage as a fallback
      let authToken = '';
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          if (parsedUser && parsedUser.token) {
            authToken = parsedUser.token;
          }
        }
      }

      // Use token in query parameter for reliable authentication
      const url = authToken
        ? `/api/admin/agents/approve?token=${encodeURIComponent(authToken)}`
        : '/api/admin/agents/approve';

      const response = await axios.post(url,
        { agentId },
        {
          headers: {
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json',
            // Include token in Authorization header as a fallback
            ...(authToken && { 'Authorization': `Bearer ${authToken}` })
          },
          withCredentials: true // Include cookies in the request
        }
      );

      if (response.data.success) {
        // Update local state
        setAgents(prevAgents =>
          prevAgents.map(agent =>
            agent.id === agentId
              ? { ...agent, verificationStatus: 'approved', verificationDate: new Date().toISOString() }
              : agent
          )
        );
      } else {
        setError(response.data.message || 'Failed to approve agent');
      }
    } catch (error) {
      console.error('Error approving agent:', error);
      if (error.response) {
        setError(`Server error: ${error.response.data.message || error.response.statusText}`);
      } else {
        setError('An error occurred while approving the agent. Please try again.');
      }
    } finally {
      setProcessingId(null);
    }
  };

  // Open rejection modal
  const openRejectModal = (agent) => {
    setSelectedAgent(agent);
    setIsModalOpen(true);
  };

  // Reject agent
  const rejectAgent = async () => {
    if (!selectedAgent) return;

    try {
      setProcessingId(selectedAgent.id);

      // Get token from localStorage as a fallback
      let authToken = '';
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          if (parsedUser && parsedUser.token) {
            authToken = parsedUser.token;
          }
        }
      }

      // Use token in query parameter for reliable authentication
      const url = authToken
        ? `/api/admin/agents/reject?token=${encodeURIComponent(authToken)}`
        : '/api/admin/agents/reject';

      const response = await axios.post(url,
        {
          agentId: selectedAgent.id,
          rejectionReason: "Agent application rejected by admin."
        },
        {
          headers: {
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json',
            // Include token in Authorization header as a fallback
            ...(authToken && { 'Authorization': `Bearer ${authToken}` })
          },
          withCredentials: true // Include cookies in the request
        }
      );

      if (response.data.success) {
        // Update local state
        setAgents(prevAgents =>
          prevAgents.map(agent =>
            agent.id === selectedAgent.id
              ? {
                  ...agent,
                  verificationStatus: 'rejected',
                  rejectionReason: "Agent application rejected by admin.",
                  rejectionDate: new Date().toISOString()
                }
              : agent
          )
        );
        setIsModalOpen(false);
      } else {
        setError(response.data.message || 'Failed to reject agent');
      }
    } catch (error) {
      console.error('Error rejecting agent:', error);
      if (error.response) {
        setError(`Server error: ${error.response.data.message || error.response.statusText}`);
      } else {
        setError('An error occurred while rejecting the agent. Please try again.');
      }
    } finally {
      setProcessingId(null);
    }
  };

  // Update all existing agents to approved status
  const updateAllAgents = async () => {
    try {
      setIsUpdatingAll(true);

      // Get token from localStorage as a fallback
      let authToken = '';
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          if (parsedUser && parsedUser.token) {
            authToken = parsedUser.token;
          }
        }
      }

      // Use token in query parameter for reliable authentication
      const updateUrl = authToken
        ? `/api/admin/agents/update-all?token=${encodeURIComponent(authToken)}`
        : '/api/admin/agents/update-all';

      const response = await axios.post(updateUrl,
        {},
        {
          headers: {
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json',
            // Include token in Authorization header as a fallback
            ...(authToken && { 'Authorization': `Bearer ${authToken}` })
          },
          withCredentials: true // Include cookies in the request
        }
      );

      if (response.data.success) {
        // Refresh the agent list
        const refreshUrl = authToken
          ? `/api/admin/agents?token=${encodeURIComponent(authToken)}`
          : '/api/admin/agents';

        const refreshResponse = await axios.get(refreshUrl, {
          headers: {
            'Cache-Control': 'no-cache',
            // Include token in Authorization header as a fallback
            ...(authToken && { 'Authorization': `Bearer ${authToken}` })
          },
          withCredentials: true // Include cookies in the request
        });

        if (refreshResponse.data.success) {
          setAgents(refreshResponse.data.agents || []);
        }

        // Show success message
        setError(null);
        alert(response.data.message);
      } else {
        setError(response.data.message || 'Failed to update agents');
      }
    } catch (error) {
      console.error('Error updating all agents:', error);
      if (error.response) {
        setError(`Server error: ${error.response.data.message || error.response.statusText}`);
      } else {
        setError('An error occurred while updating agents. Please try again.');
      }
    } finally {
      setIsUpdatingAll(false);
    }
  };

  // Filter agents based on active tab
  const filteredAgents = agents.filter(agent => {
    if (activeTab === 'pending') return agent.verificationStatus === 'pending';
    if (activeTab === 'approved') return agent.verificationStatus === 'approved';
    if (activeTab === 'rejected') return agent.verificationStatus === 'rejected';
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <SalesLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Agent Management</h1>

          <button
            onClick={updateAllAgents}
            disabled={isUpdatingAll}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdatingAll ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Update All Existing Agents'
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('pending')}
              className={`${
                activeTab === 'pending'
                  ? 'border-rose-500 text-rose-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Pending Verification ({agents.filter(a => a.verificationStatus === 'pending').length})
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`${
                activeTab === 'approved'
                  ? 'border-rose-500 text-rose-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Approved Agents ({agents.filter(a => a.verificationStatus === 'approved').length})
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`${
                activeTab === 'rejected'
                  ? 'border-rose-500 text-rose-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Rejected Agents ({agents.filter(a => a.verificationStatus === 'rejected').length})
            </button>
          </nav>
        </div>

        {/* Agents Table */}
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900">
              {activeTab === 'pending' && 'Pending Verification'}
              {activeTab === 'approved' && 'Approved Agents'}
              {activeTab === 'rejected' && 'Rejected Agents'}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {activeTab === 'pending' && 'Review and verify agent accounts'}
              {activeTab === 'approved' && 'Manage approved agent accounts'}
              {activeTab === 'rejected' && 'View rejected agent accounts'}
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="text-center py-12">
              <FaUserCog className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No agents found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {activeTab === 'pending' && 'There are no pending agent verifications at the moment.'}
                {activeTab === 'approved' && 'There are no approved agents at the moment.'}
                {activeTab === 'rejected' && 'There are no rejected agents at the moment.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Agent
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Signup Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAgents.map((agent) => (
                    <tr key={agent.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <FaUser className="h-5 w-5 text-gray-500" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{agent.username}</div>
                            <div className="text-sm text-gray-500">Projects: {agent.projectCount || 0}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="flex items-center text-sm text-gray-900">
                            <FaEnvelope className="mr-2 text-gray-400" />
                            {agent.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <FaPhone className="mr-2 text-gray-400" />
                            {agent.phoneNumber || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <FaCalendarAlt className="mr-2 text-gray-400" />
                          {formatDate(agent.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {agent.verificationStatus === 'pending' && (
                          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full flex items-center w-fit">
                            <FaHourglass className="mr-1" /> Pending
                          </span>
                        )}
                        {agent.verificationStatus === 'approved' && (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full flex items-center w-fit">
                            <FaCheck className="mr-1" /> Approved
                          </span>
                        )}
                        {agent.verificationStatus === 'rejected' && (
                          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full flex items-center w-fit">
                            <FaTimes className="mr-1" /> Rejected
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {agent.verificationStatus === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => approveAgent(agent.id)}
                              disabled={processingId === agent.id}
                              className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {processingId === agent.id ? 'Processing...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => openRejectModal(agent)}
                              disabled={processingId === agent.id}
                              className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {agent.verificationStatus === 'approved' && (
                          <span className="text-gray-500">Approved on {formatDate(agent.verificationDate)}</span>
                        )}
                        {agent.verificationStatus === 'rejected' && (
                          <span className="text-gray-500">Rejected on {formatDate(agent.rejectionDate)}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Rejection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Reject Agent</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to reject this agent?
            </p>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={rejectAgent}
                disabled={processingId === selectedAgent?.id}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingId === selectedAgent?.id ? 'Processing...' : 'Reject Agent'}
              </button>
            </div>
          </div>
        </div>
      )}
    </SalesLayout>
  );
}
