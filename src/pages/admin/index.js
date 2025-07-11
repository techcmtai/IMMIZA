import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { FaPhone, FaUsers, FaPassport, FaGlobe, FaUserTie } from 'react-icons/fa';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState([]);
  const [appStats, setAppStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch applications for statistics
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/applications/');
        if (response.data.success) {
          const apps = response.data.applications || [];
          setApplications(apps);

          // Calculate statistics
          const approved = apps.filter(app => app.currentStatus === 'Visa Approved').length;
          const rejected = apps.filter(app => app.currentStatus === 'Visa Rejected').length;
          const pending = apps.filter(app =>
            !['Visa Approved', 'Visa Rejected', 'Ticket Closed'].includes(app.currentStatus)
          ).length;

          setAppStats({
            total: apps.length,
            approved,
            pending,
            rejected
          });
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchApplications();
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

        {/* Application Statistics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Application Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white shadow rounded-lg p-4 border-l-4 border-blue-500">
              <div className="text-sm font-medium text-gray-500">Total Applications</div>
              <div className="mt-1 text-3xl font-semibold text-gray-900">{appStats.total}</div>
            </div>
            <div className="bg-white shadow rounded-lg p-4 border-l-4 border-green-500">
              <div className="text-sm font-medium text-gray-500">Approved</div>
              <div className="mt-1 text-3xl font-semibold text-gray-900">{appStats.approved}</div>
            </div>
            <div className="bg-white shadow rounded-lg p-4 border-l-4 border-yellow-500">
              <div className="text-sm font-medium text-gray-500">Pending</div>
              <div className="mt-1 text-3xl font-semibold text-gray-900">{appStats.pending}</div>
            </div>
            <div className="bg-white shadow rounded-lg p-4 border-l-4 border-red-500">
              <div className="text-sm font-medium text-gray-500">Rejected</div>
              <div className="mt-1 text-3xl font-semibold text-gray-900">{appStats.rejected}</div>
            </div>
          </div>
        </div>



        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">

          <div className="border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
              <Link href="/admin/applications" className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FaPassport className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Visa Applications</h3>
                    <p className="text-sm text-gray-500">Manage visa applications</p>
                  </div>
                </div>
              </Link>

              <Link href="/admin/contacts" className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="bg-pink-100 p-3 rounded-full">
                    <FaPhone className="h-6 w-6 text-pink-500" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Contact Submissions</h3>
                    <p className="text-sm text-gray-500">Manage contact form submissions</p>
                  </div>
                </div>
              </Link>

              <Link href="/admin/users" className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="bg-indigo-100 p-3 rounded-full">
                    <FaUsers className="h-6 w-6 text-indigo-500" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">User Management</h3>
                    <p className="text-sm text-gray-500">Manage user accounts</p>
                  </div>
                </div>
              </Link>

              <Link href="/admin/countries" className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-full">
                    <FaGlobe className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Countries</h3>
                    <p className="text-sm text-gray-500">Manage country information</p>
                  </div>
                </div>
              </Link>

              <Link href="/admin/agents" className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <FaUserTie className="h-6 w-6 text-purple-500" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Agent Management</h3>
                    <p className="text-sm text-gray-500">Verify and manage agents</p>
                  </div>
                </div>
              </Link>

              <Link href="/admin/employees" className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="bg-orange-100 p-3 rounded-full">
                    <FaUsers className="h-6 w-6 text-orange-500" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Employee Management</h3>
                    <p className="text-sm text-gray-500">Manage employees by country & visa type</p>
                  </div>
                </div>
              </Link>

            </div>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Recent Applications</h2>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Latest visa applications submitted</p>
            </div>
            <Link
              href="/admin/applications"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              View All
            </Link>
          </div>
          <div className="border-t border-gray-200">
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : applications.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Destination
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {applications.slice(0, 5).map((app) => (
                      <tr key={app.id || app._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{app.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{app.destination?.name || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{app.visaType} Visa</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            app.currentStatus === 'Visa Approved' ? 'bg-green-100 text-green-800' :
                            app.currentStatus === 'Visa Rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {app.currentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatSubmissionDate(app.submissionDateISO || app.submissionDate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No applications found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
