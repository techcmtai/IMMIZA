import React from 'react';
import { FaTimesCircle } from 'react-icons/fa';

const RejectedVerificationView = ({ rejectionReason, rejectionDate }) => {
  // Format the rejection date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white shadow rounded-lg p-8 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-red-100 mb-6">
          <FaTimesCircle className="h-12 w-12 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
        <p className="text-gray-600">
          We're sorry, but your agent account verification was not successful.
        </p>
      </div>

      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-red-700">
              {rejectionReason || 'Your application did not meet our verification requirements.'}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Verification Status</dt>
            <dd className="mt-1 text-sm text-gray-900">
              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                Rejected
              </span>
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Decision Date</dt>
            <dd className="mt-1 text-sm text-gray-900">{formatDate(rejectionDate)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-8 border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">What can you do now?</h3>
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          <li>Review the rejection reason provided above</li>
          <li>Make sure all your information is accurate and complete</li>
          <li>Contact our support team for more information or to appeal this decision</li>
          <li>You may be able to reapply after addressing the issues mentioned</li>
        </ul>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        If you believe this is an error or would like to provide additional information, please contact our support team at{' '}
        <a href="mailto:support@immiza.com" className="text-rose-600 hover:text-rose-500">
          support@immiza.com
        </a>
      </div>
    </div>
  );
};

export default RejectedVerificationView;
