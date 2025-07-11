import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import SubmittedApplications from '@/components/SubmittedApplications';
import Link from 'next/link';

// We'll fetch applications from the API instead of using sample data

export default function Dashboard() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Fetch applications from the API
  useEffect(() => {
    const fetchApplications = async () => {
      if (!user?.id) return; // Don't fetch if user ID is not available

      try {
        // Use axios instead of fetch for better error handling
        const response = await axios.get('/api/applications/',
          {
            params: {
              userId: user.id
            }
          }
         );
        if (response.data.success) {
          setApplications(response.data.applications);
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
        // Don't show an error to the user, just use empty applications array
        setApplications([]);
      }
    };
    fetchApplications();
  }, [user]); // Fetch when user changes

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Track the status of your visa applications
                </p>
              </div>
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-sm font-medium rounded-md text-white hover:bg-blue-700"
              >
                Apply for New Visa
              </Link>
            </div>
          </div>

          {/* Applications Content */}
          <div className="p-4">
            <SubmittedApplications applications={applications} />
          </div>

          {/* Offer Letter Content */}
          {applications.map((application) => (
            <div key={application.id || application._id} className="bg-white rounded-lg border p-6 shadow-sm mb-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{application.name}</h3>
                  <p className="text-gray-600 text-sm">
                    {application.visaType && application.destination?.name
                      ? `${application.visaType} Visa - ${application.destination.name}`
                      : application.visaType || application.destination?.name || ''}
                  </p>
                  <p className="text-xs text-gray-500">Application ID: {application.id || application._id}</p>
                </div>
                {/* You can add status badge or other info here if needed */}
              </div>

              {/* Offer Letter Section */}
              {Array.isArray(application.documents) ? (
                (() => {
                  const offerLetter = application.documents.find(doc => doc.type === 'Offer Letter' && doc.url);
                  if (offerLetter) {
                    return (
                      <div className="mt-4 border-t pt-4">
                        <h4 className="text-md font-semibold text-gray-800 mb-1">Offer Letter</h4>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-700">
                              {offerLetter.originalName || "Offer Letter"}
                              {offerLetter.size && (
                                <> ({Math.round(offerLetter.size / 1024)} KB)</>
                              )}
                            </p>
                            <p className="text-xs text-gray-500">{offerLetter.type}</p>
                          </div>
                          <a
                            href={offerLetter.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            View Offer Letter
                          </a>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div className="mt-4 border-t pt-4">
                        <h4 className="text-md font-semibold text-gray-800 mb-1">Offer Letter</h4>
                        <p className="text-sm text-gray-500 italic">Not Available</p>
                      </div>
                    );
                  }
                })()
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
