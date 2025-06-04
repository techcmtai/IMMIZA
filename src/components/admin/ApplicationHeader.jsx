import React from 'react';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

const ApplicationHeader = ({ title }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center">
        <Link
          href="/admin/applications"
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          <FaArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      </div>
    </div>
  );
};

export default ApplicationHeader;
