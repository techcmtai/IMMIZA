import React from 'react';
import { FaHourglassHalf } from 'react-icons/fa';

const PendingVerificationView = ({ verificationDate }) => {
  // Format the verification date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate expected verification completion date (24 hours after submission)
  const getExpectedCompletionDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    date.setHours(date.getHours() + 24);
    return formatDate(date);
  };

  return (
    <div className="bg-white shadow rounded-lg p-8 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-yellow-100 mb-6">
          <FaHourglassHalf className="h-12 w-12 text-yellow-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Verification Pending</h2>
        <p className="text-gray-600">
          Your agent account is currently under review by our team.
        </p>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Please wait while we verify your information. This process typically takes up to 24 hours.
              You'll be notified once your account is approved.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Verification Status</dt>
            <dd className="mt-1 text-sm text-gray-900">
              <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                Pending
              </span>
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Submitted On</dt>
            <dd className="mt-1 text-sm text-gray-900">{formatDate(verificationDate)}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Expected Completion</dt>
            <dd className="mt-1 text-sm text-gray-900">{getExpectedCompletionDate(verificationDate)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-8 border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">What happens next?</h3>
        <ol className="list-decimal pl-5 space-y-2 text-gray-600">
          <li>Our team reviews your agent account application</li>
          <li>Once approved, you'll gain access to the full agent dashboard</li>
          <li>You'll be able to view and accept visa applications</li>
          <li>You'll receive an email notification when your account is approved</li>
        </ol>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        If you have any questions, please contact our support team at{' '}
        <a href="mailto:support@immiza.com" className="text-rose-600 hover:text-rose-500">
          support@immiza.com
        </a>
      </div>
    </div>
  );
};

export default PendingVerificationView;
