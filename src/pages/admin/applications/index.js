import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import ApplicationFilters from '@/components/admin/ApplicationFilters';
import ApplicationTable from '@/components/admin/ApplicationTable';
import ApplicationStatistics from '@/components/admin/ApplicationStatistics';
import AdminLayout from '@/components/admin/AdminLayout';
import { FaTrash, FaTimes } from 'react-icons/fa';

export default function AdminApplications() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { userId } = router.query;
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [visaTypeFilter, setVisaTypeFilter] = useState('all');
  const [destinationFilter, setDestinationFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('submissionDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModalMessage, setDeleteModalMessage] = useState('');

  // Lists for filter dropdowns
  const [visaTypes, setVisaTypes] = useState(['all']);
  const [destinations, setDestinations] = useState(['all']);

  // Status options for filtering
  const statusOptions = [
    'all',
    'Document Submitted',
    'Additional Documents Needed',
    'Additional Documents Submitted',
    'Documents Verified',
    'Visa Application Submitted',
    'Visa Verification In Progress',
    'Visa Approved',
    'Visa Rejected',
    'Ticket Closed'
  ];

  // Redirect if not admin
  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch all applications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/applications');
        if (response.data.success) {
          const apps = response.data.applications || [];
          setApplications(apps);

          // Extract unique visa types
          const uniqueVisaTypes = ['all', ...new Set(apps.map(app => app.visaType).filter(Boolean))];
          setVisaTypes(uniqueVisaTypes);

          // Extract unique destinations
          const uniqueDestinations = ['all', ...new Set(apps.map(app => app.destination?.name).filter(Boolean))];
          setDestinations(uniqueDestinations);
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

    if (user && user.role === 'admin') {
      fetchApplications();
    }
  }, [user]);

  // Search functionality is enabled

  // Filter applications based on status, visa type, destination, and search term
  const filteredApplications = applications.filter(app => {
    const matchesUserId = !userId || app.userId === userId;
    const matchesStatus = statusFilter === 'all' || app.currentStatus === statusFilter;
    const matchesVisaType = visaTypeFilter === 'all' || app.visaType === visaTypeFilter;
    const matchesDestination = destinationFilter === 'all' || app.destination?.name === destinationFilter;
    const matchesSearch =
      searchTerm === '' ||
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.destination?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.visaType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.id || app._id).toString().includes(searchTerm);

    return matchesUserId && matchesStatus && matchesVisaType && matchesDestination && matchesSearch;
  });

  // Sort applications
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'status':
        aValue = a.currentStatus;
        bValue = b.currentStatus;
        break;
      case 'destination':
        aValue = (a.destination?.name || '').toLowerCase();
        bValue = (b.destination?.name || '').toLowerCase();
        break;
      case 'visaType':
        aValue = (a.visaType || '').toLowerCase();
        bValue = (b.visaType || '').toLowerCase();
        break;
      case 'submissionDate':
      default:
        // Handle Firestore timestamps for sorting
        if (a.submissionDateISO) {
          aValue = new Date(a.submissionDateISO);
        } else if (a.submissionDate && a.submissionDate.seconds) {
          aValue = new Date(a.submissionDate.seconds * 1000);
        } else {
          aValue = new Date(a.submissionDate || 0);
        }

        if (b.submissionDateISO) {
          bValue = new Date(b.submissionDateISO);
        } else if (b.submissionDate && b.submissionDate.seconds) {
          bValue = new Date(b.submissionDate.seconds * 1000);
        } else {
          bValue = new Date(b.submissionDate || 0);
        }
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Handle sort change
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Format date for display
  const formatDate = (firestoreDate) => {
    if (!firestoreDate) return 'N/A';

    // Handle Firestore Timestamp objects
    if (firestoreDate && firestoreDate.seconds) {
      return new Date(firestoreDate.seconds * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }

    // Handle ISO strings
    if (typeof firestoreDate === 'string') {
      try {
        return new Date(firestoreDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } catch (error) {
        return 'Invalid Date';
      }
    }

    // Handle Date objects
    if (firestoreDate instanceof Date) {
      return firestoreDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }

    return 'N/A';
  };

  // Get status color class
  const getStatusColor = (status) => {
    switch (status) {
      case 'Document Submitted':
        return 'bg-blue-100 text-blue-800';
      case 'Documents Verified':
        return 'bg-indigo-100 text-indigo-800';
      case 'Additional Documents Needed':
        return 'bg-yellow-100 text-yellow-800';
      case 'Visa Application Submitted':
        return 'bg-purple-100 text-purple-800';
      case 'Visa Verification In Progress':
        return 'bg-orange-100 text-orange-800';
      case 'Visa Approved':
        return 'bg-green-100 text-green-800';
      case 'Visa Rejected':
        return 'bg-red-100 text-red-800';
      case 'Ticket Closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Delete handler
  const handleDeleteClick = (application) => {
    setDeleteTarget(application);
    setDeleteConfirmText('');
    setDeleteModalMessage('');
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteModalMessage('');
    try {
      // Replace with your actual delete API call
      const res = await axios.delete(`/api/applications/${deleteTarget.id || deleteTarget._id}`);
      if (res.data && res.data.success) {
        setDeleteModalMessage('Application deleted successfully.');
        setApplications(applications.filter(app => (app.id || app._id) !== (deleteTarget.id || deleteTarget._id)));
        setTimeout(() => {
          setShowDeleteModal(false);
          setDeleteTarget(null);
          setDeleteConfirmText('');
          setDeleteModalMessage('');
        }, 1000);
      } else {
        setDeleteModalMessage(res.data.message || 'Failed to delete application.');
      }
    } catch (err) {
      setDeleteModalMessage(err.response?.data?.message || 'Failed to delete application.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Visa Applications</h1>
          <Link
            href="/admin"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to Dashboard
          </Link>
        </div>

        {userId && (
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 rounded-md flex justify-between items-center">
            <span>Filtering applications for a specific user.</span>
            <button
              onClick={() => router.push('/admin/applications')}
              className="text-blue-700 hover:text-blue-900 font-bold"
            >
              <FaTimes className="mr-1 inline-block" />
              Clear Filter
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-6 rounded">
            {error}
          </div>
        )}

        {/* Filters */}
        <ApplicationFilters
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          visaTypeFilter={visaTypeFilter}
          setVisaTypeFilter={setVisaTypeFilter}
          destinationFilter={destinationFilter}
          setDestinationFilter={setDestinationFilter}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusOptions={statusOptions}
          visaTypes={visaTypes}
          destinations={destinations}
        />

        {/* Applications Table */}
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <ApplicationTable
            isLoading={isLoading}
            sortedApplications={sortedApplications}
            handleSort={handleSort}
            getStatusColor={getStatusColor}
            formatDate={formatDate}
            onDeleteClick={handleDeleteClick}
          />
        </div>

        {/* Statistics */}
        <ApplicationStatistics applications={applications} />

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
        <div className="fixed inset-0 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <div className="flex items-center mb-4">
                <FaTrash className="text-red-500 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Confirm Delete</h2>
              </div>
              <p className="mb-4 text-gray-700">Type <span className="font-bold">confirm</span> to delete this application. This action cannot be undone.</p>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="confirm"
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
                disabled={isDeleting}
              />
              {deleteModalMessage && (
                <div className={`mb-2 text-sm ${deleteModalMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{deleteModalMessage}</div>
              )}
              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); setDeleteConfirmText(''); setDeleteModalMessage(''); }}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  className={`px-4 py-2 rounded-md text-white font-medium ${deleteConfirmText === 'confirm' && !isDeleting ? 'bg-red-600 hover:bg-red-700' : 'bg-red-300 cursor-not-allowed'}`}
                  onClick={handleDeleteConfirm}
                  disabled={deleteConfirmText !== 'confirm' || isDeleting}
                >
                  {isDeleting ? (
                    <svg className="animate-spin h-5 w-5 mr-2 inline-block text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                  ) : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
