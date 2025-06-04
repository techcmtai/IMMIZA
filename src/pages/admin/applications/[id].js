import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import ApplicationHeader from '@/components/admin/ApplicationHeader';
import ApplicationInfo from '@/components/admin/ApplicationInfo';
import DocumentsList from '@/components/admin/DocumentsList';
import StatusHistory from '@/components/admin/StatusHistory';
import StatusUpdateForm from '@/components/admin/StatusUpdateForm';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import NotFoundMessage from '@/components/admin/NotFoundMessage';
import AdminLayout from '@/components/admin/AdminLayout';

export default function ApplicationDetail() {
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

  // Status options - limited to only 4 main statuses
  const statusOptions = [
    'Document Submitted',
    'Additional Documents Needed',
    'Additional Document Submitted',
    'Visa Approved'
  ];

  // Redirect if not admin
  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, loading, router]);

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

    if (user && user.role === 'admin' && id) {
      fetchApplication();
    }
  }, [user, id]);

  // Handle status update
  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateSuccess(false);
    setUpdateError('');

    try {
      // Filter out empty document entries and ensure they are strings
      const filteredDocuments = requiredDocuments
        .filter(doc => doc && doc.trim() !== '')
        .map(doc => doc.trim());

      console.log('Sending status update with documents:', filteredDocuments);

      // Make sure we have at least one document if status is "Additional Documents Needed"
      if (newStatus === 'Additional Documents Needed' && filteredDocuments.length === 0) {
        setUpdateError('Please add at least one required document');
        setIsUpdating(false);
        return;
      }

      const requestData = {
        status: newStatus,
        note: statusNote,
        tentativeDate: tentativeDate ? new Date(tentativeDate).toISOString() : null,
        requiredDocuments: newStatus === 'Additional Documents Needed' ? filteredDocuments : []
      };

      console.log('Full request data:', requestData);

      const response = await axios.put(`/api/applications/${id}`, requestData);

      console.log('API response:', response.data);

      if (response.data.success) {
        console.log('Status update successful');
        console.log('Updated application:', response.data.application);
        console.log('Status history:', response.data.application.statusHistory);

        // Check if requiredDocuments were saved
        const latestStatus = response.data.application.statusHistory[response.data.application.statusHistory.length - 1];
        console.log('Latest status entry:', latestStatus);
        console.log('Required documents in latest status:', latestStatus.requiredDocuments);

        setApplication(response.data.application);
        setUpdateSuccess(true);
        setStatusNote('');
        setTentativeDate('');
        setRequiredDocuments(['']);

        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setUpdateSuccess(false);
        }, 3000);
      } else {
        console.error('Status update failed:', response.data.message);
        setUpdateError(response.data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      setUpdateError('An error occurred while updating the status. Please try again.');
    } finally {
      setIsUpdating(false);
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
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    // Handle ISO strings
    if (typeof firestoreDate === 'string') {
      return new Date(firestoreDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    // Handle Date objects
    if (firestoreDate instanceof Date) {
      return firestoreDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <LoadingSpinner size="large" color="rose" />
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ApplicationHeader title="Application Details" />

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-6 rounded">
            {error}
          </div>
        )}

        {isLoading ? (
          <LoadingSpinner color="blue" />
        ) : application ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column - Application Info */}
            <div className="md:col-span-2 space-y-6">
              <ApplicationInfo
                application={application}
                getStatusColor={getStatusColor}
              />

              {/* Documents Section */}
              <DocumentsList documents={application.documents} />

              {/* Status History */}
              <StatusHistory
                statusHistory={application.statusHistory}
                getStatusColor={getStatusColor}
                formatDate={formatDate}
              />
            </div>

            {/* Right Column - Update Status */}
            <div className="md:col-span-1">
              <StatusUpdateForm
                statusOptions={statusOptions}
                newStatus={newStatus}
                setNewStatus={setNewStatus}
                tentativeDate={tentativeDate}
                setTentativeDate={setTentativeDate}
                statusNote={statusNote}
                setStatusNote={setStatusNote}
                requiredDocuments={requiredDocuments}
                setRequiredDocuments={setRequiredDocuments}
                handleStatusUpdate={handleStatusUpdate}
                isUpdating={isUpdating}
                updateSuccess={updateSuccess}
                updateError={updateError}
              />
            </div>
          </div>
        ) : (
          <NotFoundMessage />
        )}
      </div>
    </AdminLayout>
  );
}
