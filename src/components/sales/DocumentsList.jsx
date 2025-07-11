import React from 'react';
import { useRouter } from 'next/router';
import { FaFileAlt } from 'react-icons/fa';

const DocumentsList = ({ documents = [] }) => {
  const router = useRouter();

  return (
    <div className="bg-white shadow overflow-hidden rounded-lg">
      <div className="px-4 py-5 sm:px-6 bg-gray-50 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Documents</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Uploaded documents for this application.</p>
        </div>
        <FaFileAlt className="h-5 w-5 text-gray-400" />
      </div>
      <div className="border-t border-gray-200">
        {documents && documents.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {documents.map((doc, index) => (
              <li key={index} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{doc.type}</p>
                      <p className="text-sm text-gray-500">
                        {doc.originalName}
                      </p>
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => {
                        // Use our custom document viewer for all documents
                        router.push(`/document-viewer?url=${encodeURIComponent(doc.url)}&type=${encodeURIComponent(doc.type)}`);
                      }}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      View Document
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-4 py-5 sm:p-6 text-center text-sm text-gray-500">
            No documents available.
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsList;
