import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { FaUser, FaEnvelope, FaCalendarAlt, FaEdit, FaTrash, FaTimes, FaUserShield, FaUserCog, FaPhone } from 'react-icons/fa';
import AdminLayout from '@/components/admin/AdminLayout';

export default function UsersAdmin() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userRole, setUserRole] = useState('user');
  const [roleFilter, setRoleFilter] = useState('all');

  // Redirect if not admin
  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching users, user:', user ? `${user.username} (${user.role})` : 'No user');

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
          ? `/api/admin/users?token=${encodeURIComponent(authToken)}`
          : '/api/admin/users';

        console.log('Fetching users with URL:', url.includes('token=') ? 'URL with token' : 'URL without token');

        const response = await fetch(url, {
          credentials: 'include', // Include cookies in the request
          headers: {
            'Cache-Control': 'no-cache',
            // Include token in Authorization header as a fallback
            ...(authToken && { 'Authorization': `Bearer ${authToken}` })
          },
        });

        if (!response.ok) {
          console.error(`Users API error: ${response.status}`);
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Users data received:', data.count);

        if (data.success) {
          setUsers(data.data || []);
        } else {
          setError(data.message || 'Failed to fetch users');
        }
      } catch (error) {
        setError('Error loading users. Please try again later.');
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  // Delete user
  const deleteUser = async (userId) => {
    if (!userId) {
      setError('User ID is missing');
      return;
    }

    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        // Get token from localStorage
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

        // Use token in query parameter
        const url = authToken
          ? `/api/admin/users?token=${encodeURIComponent(authToken)}`
          : '/api/admin/users';

        const response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            ...(authToken && { 'Authorization': `Bearer ${authToken}` })
          },
          credentials: 'include', // Include cookies in the request
          body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          // Update the users list - filter by either id or _id or uid
          setUsers(users.filter(u => {
            const currentId = u.id || u._id || u.uid;
            return currentId !== userId;
          }));
        } else {
          setError(data.message || 'Failed to delete user');
        }
      } catch (error) {
        setError('Something went wrong');
        console.error('Error deleting user:', error);
      }
    }
  };

  // Format date
  const formatDate = (dateValue) => {
    try {
      // Handle different date formats from Firestore
      let date;

      // If it's a Firestore Timestamp (has seconds and nanoseconds)
      if (dateValue && dateValue.seconds) {
        date = new Date(dateValue.seconds * 1000);
      }
      // If it's a string date
      else if (dateValue && typeof dateValue === 'string') {
        date = new Date(dateValue);
      }
      // If it's already a Date object
      else if (dateValue instanceof Date) {
        date = dateValue;
      }
      // If it's a number (timestamp)
      else if (dateValue && typeof dateValue === 'number') {
        date = new Date(dateValue);
      }
      // Default case - current date
      else {
        console.warn('Invalid date format:', dateValue);
        return 'N/A';
      }

      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateValue);
        return 'N/A';
      }

      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return date.toLocaleDateString(undefined, options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'user':
        return 'bg-blue-100 text-blue-800';
      case 'agent':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Open modal with user details
  const openUserModal = (user) => {
    setSelectedUser(user);
    setUserRole(user.role);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  // Update user role
  const updateUser = async () => {
    try {
      // Use either id or _id or uid, whichever is available
      const userId = selectedUser.id || selectedUser._id || selectedUser.uid;

      if (!userId) {
        throw new Error('User ID is missing');
      }

      // Get token from localStorage
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

      // Use token in query parameter
      const url = authToken
        ? `/api/admin/users?token=${encodeURIComponent(authToken)}`
        : '/api/admin/users';

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        credentials: 'include', // Include cookies in the request
        body: JSON.stringify({
          userId: userId,
          role: userRole,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Update the user in the users list
        setUsers(
          users.map((u) => {
            // Match by either id or _id or uid
            const currentId = u.id || u._id || u.uid;
            const selectedId = selectedUser.id || selectedUser._id || selectedUser.uid;

            return currentId === selectedId
              ? { ...u, role: userRole }
              : u;
          })
        );
        closeModal();
      } else {
        setError(data.message || 'Failed to update user');
      }
    } catch (error) {
      setError('Something went wrong');
      console.error('Error updating user:', error);
    }
  };

  // Filter users by role
  const filteredUsers = roleFilter === 'all'
    ? users
    : users.filter(user => user.role === roleFilter);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">User Management</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-6 rounded">
            {error}
          </div>
        )}

        {/* Role filter */}
        <div className="mb-6">
          <label htmlFor="roleFilter" className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Role
          </label>
          <select
            id="roleFilter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Users</option>
            <option value="user">Regular Users</option>
            <option value="admin">Administrators</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-gray-50 p-6 text-center rounded-lg">
            <p className="text-gray-500">No users found.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {/* Desktop view - Table */}
            <div className="hidden md:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Username
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((userData) => (
                    <tr key={userData.id || userData._id || userData.uid}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaUser className="text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{userData.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaEnvelope className="text-gray-400 mr-2" />
                          <span className="text-sm text-gray-500">{userData.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaPhone className="text-gray-400 mr-2" />
                          <span className="text-sm text-gray-500">{userData.phoneNumber}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaCalendarAlt className="text-gray-400 mr-2" />
                          <span className="text-sm text-gray-500">{formatDate(userData.createdAt)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeColor(userData.role)}`}>
                          {userData.role === 'admin'
                            ? 'Administrator'
                            : userData.role === 'agent'
                              ? 'Agent'
                              : 'User'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => openUserModal(userData)}
                            className="text-indigo-600 hover:text-indigo-900 cursor-pointer p-2 hover:bg-indigo-50 rounded-full"
                            title="Edit User"
                          >
                            <FaEdit />
                          </button>
                          {(userData.id || userData._id || userData.uid) !== user.id && (
                            <button
                              onClick={() => deleteUser(userData.id || userData._id || userData.uid)}
                              className="text-red-600 hover:text-red-900 cursor-pointer p-2 hover:bg-red-50 rounded-full"
                              title="Delete User"
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile view - Cards */}
            <div className="md:hidden">
              <div className="divide-y divide-gray-200">
                {filteredUsers.map((userData) => (
                  <div key={userData.id || userData._id || userData.uid} className="p-4 bg-white">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <FaUser className="text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{userData.username}</span>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeColor(userData.role)}`}>
                        {userData.role === 'admin'
                          ? 'Administrator'
                          : userData.role === 'agent'
                            ? 'Agent'
                            : 'User'}
                      </span>
                    </div>

                    <div className="flex items-center mb-2">
                      <FaEnvelope className="text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-xs text-gray-500 break-all">{userData.email}</span>
                    </div>

                    <div className="flex items-center mb-2">
                      <FaPhone className="text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-xs text-gray-500 break-all">{userData.phoneNumber}</span>
                    </div>

                    <div className="flex items-center mb-3">
                      <FaCalendarAlt className="text-gray-400 mr-2" />
                      <span className="text-xs text-gray-500">Joined: {formatDate(userData.createdAt)}</span>
                    </div>

                    <div className="flex justify-end space-x-3 mt-2">
                      <button
                        onClick={() => openUserModal(userData)}
                        className="p-2 text-indigo-600 hover:text-indigo-900 cursor-pointer hover:bg-indigo-50 rounded-full"
                        title="Edit User"
                      >
                        <FaEdit />
                      </button>
                      {(userData.id || userData._id || userData.uid) !== user.id && (
                        <button
                          onClick={() => deleteUser(userData.id || userData._id || userData.uid)}
                          className="p-2 text-red-600 hover:text-red-900 cursor-pointer hover:bg-red-50 rounded-full"
                          title="Delete User"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* User Edit Modal */}
        {isModalOpen && selectedUser && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white flex justify-between items-center px-4 sm:px-6 py-4 border-b z-10">
                <h3 className="text-lg font-medium text-gray-900">Edit User</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500 p-2"
                  aria-label="Close"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="px-4 sm:px-6 py-4">
                <div className="mb-4 bg-gray-50 p-3 rounded-md">
                  <div className="flex items-center mb-2">
                    <FaUser className="text-gray-400 mr-2 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900">{selectedUser.username}</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <FaEnvelope className="text-gray-400 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-500 break-all">{selectedUser.email}</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <FaPhone className="text-gray-400 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-500 break-all">{selectedUser.phoneNumber}</span>
                  </div>
                  <div className="flex items-center">
                    <FaCalendarAlt className="text-gray-400 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-500">Joined: {formatDate(selectedUser.createdAt)}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    id="role"
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="user">Regular User</option>
                    <option value="agent">Agent</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div className="mb-4 bg-yellow-50 p-3 rounded-md text-sm text-yellow-800">
                  <p className="flex items-start">
                    <FaUserShield className="text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      {userRole === 'admin'
                        ? 'Administrators have full access to all features including user management and sensitive data.'
                        : userRole === 'agent'
                          ? 'Agents can view and process visa applications. They can accept applications and update their status.'
                          : 'Regular users can only access their own data and applications.'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white px-4 sm:px-6 py-4 border-t flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-2 sm:space-y-0">
                <button
                  onClick={closeModal}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={updateUser}
                  className="w-full sm:w-auto px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 flex items-center justify-center"
                >
                  <FaUserCog className="mr-2" />
                  Update Role
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
