import React from 'react';
import Link from 'next/link';
import { FaEye, FaTrash } from 'react-icons/fa';

const ApplicationTableRow = ({ application, getStatusColor, formatDate, onDeleteClick }) => {
  return (
    <tr key={application.id || application._id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{application.name}</div>
        <div className="text-xs text-gray-500">ID: {application.id || application._id}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">{application.email}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{application.destination?.name || 'N/A'}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-xs text-gray-500 bg-blue-50 inline-block px-2 py-1 rounded-full">{application.visaType} Visa</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.currentStatus)}`}>
          {application.currentStatus}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(application.submissionDateISO || application.submissionDate)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {application.agentId ? (
          <div>
            <div className="text-sm text-gray-900">{application.agentName || 'Assigned'}</div>
            <div className="text-xs text-gray-500">{formatDate(application.acceptedAt)}</div>
          </div>
        ) : (
          <span className="text-xs text-gray-500">Not assigned</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex space-x-4">
          <Link
            href={`/admin/applications/${application.id || application._id}`}
            className="text-blue-600 hover:text-blue-900 flex items-center space-x-4"
          >
            <FaEye className="h-5 w-5" title="View Details" />
          </Link>
          <button
            type="button"
            className="text-red-600 hover:text-red-900 flex items-center cursor-pointer"
            onClick={() => onDeleteClick(application)}
            title="Delete"
          >
            <FaTrash className="h-5 w-5" title="Delete" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ApplicationTableRow;
