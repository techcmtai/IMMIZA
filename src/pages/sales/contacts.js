import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { FaPhone, FaCalendarAlt, FaEdit, FaTrash, FaTimes, FaCheck, FaUserCircle, FaTag } from 'react-icons/fa';
import SalesLayout from '@/components/sales/SalesLayout';

export default function ContactsSales() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [contactStatus, setContactStatus] = useState('new');
  const [contactNotes, setContactNotes] = useState('');

  // Redirect if not admin or sales
  useEffect(() => {
    if (!loading && (!user || !['admin', 'sales'].includes(user.role))) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch contacts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching contacts, user:', user ? `${user.username} (${user.role})` : 'No user');

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
          ? `/api/contact?token=${encodeURIComponent(authToken)}`
          : '/api/contact';

        console.log('Fetching contacts with URL:', url.includes('token=') ? 'URL with token' : 'URL without token');

        const response = await fetch(url, {
          credentials: 'include', // Include cookies in the request
          headers: {
            'Cache-Control': 'no-cache',
            // Include token in Authorization header as a fallback
            ...(authToken && { 'Authorization': `Bearer ${authToken}` })
          },
        });

        if (!response.ok) {
          console.error(`Contact API error: ${response.status}`);
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Contacts data received:', data.count);

        if (data.success) {
          setContacts(data.data || []);
        } else {
          setError(data.message || 'Failed to fetch contacts');
        }
      } catch (error) {
        setError('Error loading contacts. Please try again later.');
        console.error('Error fetching contacts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role === 'sales') {
      fetchContacts();
    }
  }, [user]);

  // Delete contact
  const deleteContact = async (contactId) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
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
          ? `/api/contact/${contactId}?token=${encodeURIComponent(authToken)}`
          : `/api/contact/${contactId}`;

        const response = await fetch(url, {
          method: 'DELETE',
          credentials: 'include', // Include cookies in the request
          headers: {
            'Cache-Control': 'no-cache',
            ...(authToken && { 'Authorization': `Bearer ${authToken}` })
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          // Update the contacts list - filter by either id or _id
          setContacts(contacts.filter(c => {
            const currentId = c.id || c._id;
            return currentId !== contactId;
          }));
        } else {
          setError(data.message || 'Failed to delete contact');
        }
      } catch (error) {
        setError('Something went wrong');
        console.error('Error deleting contact:', error);
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

      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return date.toLocaleDateString(undefined, options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'converted':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Open modal with contact details
  const openContactModal = (contact) => {
    setSelectedContact(contact);
    setContactStatus(contact.status);
    setContactNotes(contact.notes || '');
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedContact(null);
  };

  // Update contact status and notes
  const updateContact = async () => {
    try {
      // Use either id or _id, whichever is available
      const contactId = selectedContact.id || selectedContact._id;

      if (!contactId) {
        throw new Error('Contact ID is missing');
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
        ? `/api/contact/${contactId}?token=${encodeURIComponent(authToken)}`
        : `/api/contact/${contactId}`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        credentials: 'include', // Include cookies in the request
        body: JSON.stringify({
          status: contactStatus,
          notes: contactNotes,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Update the contact in the contacts list
        setContacts(
          contacts.map((c) => {
            // Match by either id or _id
            const currentId = c.id || c._id;
            const selectedId = selectedContact.id || selectedContact._id;

            return currentId === selectedId
              ? { ...c, status: contactStatus, notes: contactNotes }
              : c;
          })
        );
        closeModal();
      } else {
        setError(data.message || 'Failed to update contact');
      }
    } catch (error) {
      setError('Something went wrong');
      console.error('Error updating contact:', error);
    }
  };

  // Filter contacts by status
  const filteredContacts = statusFilter === 'all'
    ? contacts
    : contacts.filter(contact => contact.status === statusFilter);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <SalesLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Contact Submissions</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-6 rounded">
            {error}
          </div>
        )}

        {/* Status filter */}
        <div className="mb-6">
          <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Status
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Contacts</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="converted">Converted</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="bg-gray-50 p-6 text-center rounded-lg">
            <p className="text-gray-500">No contacts found.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {/* Desktop view - Table */}
            <div className="hidden md:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone Number
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Submitted
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
                  {filteredContacts.map((contact) => (
                    <tr key={contact.id || contact._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaPhone className="text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{contact.phoneNumber}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaCalendarAlt className="text-gray-400 mr-2" />
                          <span className="text-sm text-gray-500">{formatDate(contact.createdAt)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(contact.status)}`}>
                          {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => openContactModal(contact)}
                            className="text-indigo-600 hover:text-indigo-900 cursor-pointer p-2 hover:bg-indigo-50 rounded-full"
                            title="Edit Contact"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => deleteContact(contact.id || contact._id)}
                            className="text-red-600 hover:text-red-900 cursor-pointer p-2 hover:bg-red-50 rounded-full"
                            title="Delete Contact"
                          >
                            <FaTrash />
                          </button>
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
                {filteredContacts.map((contact) => (
                  <div key={contact.id || contact._id} className="p-4 bg-white">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <FaPhone className="text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{contact.phoneNumber}</span>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(contact.status)}`}>
                        {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                      </span>
                    </div>

                    <div className="flex items-center mb-3">
                      <FaCalendarAlt className="text-gray-400 mr-2" />
                      <span className="text-xs text-gray-500">{formatDate(contact.createdAt)}</span>
                    </div>

                    <div className="flex justify-end space-x-3 mt-2">
                      <button
                        onClick={() => openContactModal(contact)}
                        className="p-2 text-indigo-600 hover:text-indigo-900 cursor-pointer hover:bg-indigo-50 rounded-full"
                        title="Edit Contact"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => deleteContact(contact.id || contact._id)}
                        className="p-2 text-red-600 hover:text-red-900 cursor-pointer hover:bg-red-50 rounded-full"
                        title="Delete Contact"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Contact Edit Modal */}
        {isModalOpen && selectedContact && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white flex justify-between items-center px-4 sm:px-6 py-4 border-b z-10">
                <h3 className="text-lg font-medium text-gray-900">Contact Details</h3>
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
                    <FaPhone className="text-gray-400 mr-2 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900 break-all">{selectedContact.phoneNumber}</span>
                  </div>
                  <div className="flex items-center">
                    <FaCalendarAlt className="text-gray-400 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-500">{formatDate(selectedContact.createdAt)}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    value={contactStatus}
                    onChange={(e) => setContactStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="converted">Converted</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    value={contactNotes}
                    onChange={(e) => setContactNotes(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Add notes about this contact..."
                  ></textarea>
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
                  onClick={updateContact}
                  className="w-full sm:w-auto px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SalesLayout>
  );
}
