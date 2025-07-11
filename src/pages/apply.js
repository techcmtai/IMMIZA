import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import VisaApplicationForm from '@/components/VisaApplicationForm';
import Link from 'next/link';

export default function ApplyPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const { destinationId, destinationName, visaType } = router.query;

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

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
                <h1 className="text-2xl font-bold text-gray-900">Apply for Visa</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Fill out the form below to submit your visa application
                </p>
              </div>
              <Link
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                View My Applications
              </Link>
            </div>
          </div>

          <div className="p-4">
            <VisaApplicationForm
              destinationId={destinationId}
              destinationName={destinationName}
              visaType={visaType}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
