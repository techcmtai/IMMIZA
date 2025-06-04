import React from 'react';
import { FaHistory, FaCalendarAlt, FaFileAlt, FaCommentAlt } from 'react-icons/fa';

// Status flow with only 4 main steps - same as in SubmittedApplications.jsx
const statusFlow = [
  {
    status: 'Document Submitted',
    message: 'You have submitted the form.',
    daysToAdd: 0,
    color: 'bg-blue-100 text-blue-800',
    step: 1
  },
  {
    status: 'Additional Documents Needed',
    message: 'Additional documents needed.',
    daysToAdd: 4,
    color: 'bg-yellow-100 text-yellow-800',
    step: 2
  },
  {
    status: 'Additional Document Submitted',
    message: 'Additional documents have been submitted.',
    daysToAdd: 1,
    color: 'bg-green-100 text-green-800',
    step: 3
  },
  {
    status: 'Visa Approved',
    message: 'Your visa has been approved!',
    daysToAdd: 0,
    color: 'bg-green-100 text-green-800',
    step: 4
  }
];

const StatusHistory = ({ statusHistory = [], getStatusColor, formatDate }) => {
  // Group status entries by status type
  const groupStatusHistory = () => {
    if (!statusHistory || statusHistory.length === 0) {
      return [];
    }

    // Group by status
    const statusGroups = {};

    // Sort by date (newest first for each status)
    const sortedHistory = [...statusHistory].sort((a, b) => {
      const dateA = a.date && a.date.seconds ? new Date(a.date.seconds * 1000) : new Date(a.date || 0);
      const dateB = b.date && b.date.seconds ? new Date(b.date.seconds * 1000) : new Date(b.date || 0);
      return dateB - dateA;
    });

    // Group entries by status
    sortedHistory.forEach(entry => {
      if (!statusGroups[entry.status]) {
        statusGroups[entry.status] = {
          status: entry.status,
          date: entry.date,
          tentativeDate: entry.tentativeDate,
          requiredDocument: entry.requiredDocument,
          requiredDocuments: entry.requiredDocuments,
          notes: []
        };
      }

      // Add note to the group if it exists
      if (entry.note && entry.note !== `Status updated to ${entry.status}` && !entry.note.includes('Status updated to')) {
        statusGroups[entry.status].notes.push({
          note: entry.note,
          date: entry.date
        });
      }
    });

    // Convert to array and sort by status flow order
    const groupedEntries = Object.values(statusGroups);
    return groupedEntries.sort((a, b) => {
      const indexA = statusFlow.findIndex(s => s.status === a.status);
      const indexB = statusFlow.findIndex(s => s.status === b.status);
      return indexB - indexA; // Reverse order (newest status first)
    });
  };

  const groupedStatusHistory = groupStatusHistory();

  return (
    <div className="bg-white shadow overflow-hidden rounded-lg">
      <div className="px-4 py-5 sm:px-6 bg-[#b76e79] text-white flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium">Status History</h2>
          <p className="mt-1 max-w-2xl text-sm text-white text-opacity-90">Timeline of status changes and notes.</p>
        </div>
        <FaHistory className="h-5 w-5 text-white text-opacity-80" />
      </div>
      <div className="border-t border-gray-200">
        {groupedStatusHistory.length > 0 ? (
          <div className="px-4 py-5 sm:p-6">
            {groupedStatusHistory.map((statusGroup, groupIndex) => (
              <div key={`status-group-${groupIndex}`} className="mb-8 relative">
                {/* Status header with circle and number */}
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#b76e79] mr-3 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {statusFlow.find(s => s.status === statusGroup.status)?.step || 1}
                    </span>
                  </div>
                  <span className="text-gray-700 font-medium">{statusGroup.status}</span>
                  <span className="text-gray-500 ml-auto text-sm">
                    {formatDate(statusGroup.date)}
                  </span>
                </div>

                {/* Tentative date if available */}
                {statusGroup.tentativeDate && (
                  <div className="ml-11 mb-3">
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded inline-flex items-center">
                      <FaCalendarAlt className="mr-1" />
                      Next update: {formatDate(statusGroup.tentativeDate)}
                    </span>
                  </div>
                )}

                {/* Required documents if available */}
                {statusGroup.requiredDocuments && statusGroup.requiredDocuments.length > 0 && (
                  <div className="ml-11 mb-3 p-3 bg-yellow-50 rounded-md border-l-4 border-yellow-400">
                    <p className="text-sm font-medium text-yellow-700 flex items-center">
                      <FaFileAlt className="mr-2" />
                      Required Documents:
                    </p>
                    <ul className="list-disc pl-6 mt-1">
                      {statusGroup.requiredDocuments.map((doc, idx) => (
                        <li key={idx} className="text-sm text-yellow-700">
                          {doc}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Legacy single document support */}
                {!statusGroup.requiredDocuments && statusGroup.requiredDocument && (
                  <div className="ml-11 mb-3 p-3 bg-yellow-50 rounded-md border-l-4 border-yellow-400">
                    <p className="text-sm font-medium text-yellow-700 flex items-center">
                      <FaFileAlt className="mr-2" />
                      Required Document: {statusGroup.requiredDocument}
                    </p>
                  </div>
                )}

                {/* Notes for this status */}
                {statusGroup.notes.length > 0 && (
                  <div className="ml-11 border-l-2 border-gray-200 pl-3">
                    {statusGroup.notes.map((noteItem, noteIndex) => (
                      <div key={`note-${groupIndex}-${noteIndex}`} className="mb-3 relative">
                        <div className="absolute -left-4 top-2 w-2 h-2 rounded-full bg-gray-300"></div>
                        <div className="flex items-start">
                          <FaCommentAlt className="text-[#b76e79] mt-1 mr-2 h-3 w-3" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-700">{noteItem.note}</p>
                            <p className="text-xs text-gray-400 mt-1">{formatDate(noteItem.date)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-5 sm:p-6 text-center text-sm text-gray-500">
            No status history available.
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusHistory;
