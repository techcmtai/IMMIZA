import React from 'react';

const ApplicationStatistics = ({ applications }) => {
  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white shadow rounded-lg p-4 border-l-4 border-blue-500">
        <div className="text-sm font-medium text-gray-500">Total Applications</div>
        <div className="mt-1 text-3xl font-semibold text-gray-900">{applications.length}</div>
      </div>
      <div className="bg-white shadow rounded-lg p-4 border-l-4 border-green-500">
        <div className="text-sm font-medium text-gray-500">Approved</div>
        <div className="mt-1 text-3xl font-semibold text-gray-900">
          {applications.filter(app => app.currentStatus === 'Visa Approved').length}
        </div>
      </div>
      <div className="bg-white shadow rounded-lg p-4 border-l-4 border-yellow-500">
        <div className="text-sm font-medium text-gray-500">Pending</div>
        <div className="mt-1 text-3xl font-semibold text-gray-900">
          {applications.filter(app => 
            !['Visa Approved', 'Visa Rejected', 'Ticket Closed'].includes(app.currentStatus)
          ).length}
        </div>
      </div>
      <div className="bg-white shadow rounded-lg p-4 border-l-4 border-red-500">
        <div className="text-sm font-medium text-gray-500">Rejected</div>
        <div className="mt-1 text-3xl font-semibold text-gray-900">
          {applications.filter(app => app.currentStatus === 'Visa Rejected').length}
        </div>
      </div>
    </div>
  );
};

export default ApplicationStatistics;
