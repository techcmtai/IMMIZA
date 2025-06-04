import React from 'react';
import Link from 'next/link';

const NotFoundMessage = ({ message = 'Application not found.', linkText = 'Back to Applications', linkHref = '/admin/applications' }) => {
  return (
    <div className="text-center py-12 bg-gray-50 rounded-lg">
      <p className="text-gray-500">{message}</p>
      <Link
        href={linkHref}
        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
      >
        {linkText}
      </Link>
    </div>
  );
};

export default NotFoundMessage;
