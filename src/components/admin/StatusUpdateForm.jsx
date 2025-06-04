import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaFileAlt, FaPlus, FaMinus } from 'react-icons/fa';

const StatusUpdateForm = ({
  statusOptions,
  newStatus,
  setNewStatus,
  tentativeDate,
  setTentativeDate,
  statusNote,
  setStatusNote,
  handleStatusUpdate,
  isUpdating,
  updateSuccess,
  updateError,
  requiredDocuments,
  setRequiredDocuments
}) => {
  // Show document input field when status is "Additional Documents Needed"
  const showDocumentField = newStatus === 'Additional Documents Needed';

  // Initialize or clear document fields when status changes
  useEffect(() => {
    if (newStatus === 'Additional Documents Needed') {
      // If there are no document fields, add one empty field
      if (requiredDocuments.length === 0) {
        setRequiredDocuments(['']);
      }
    } else {
      // Clear document fields when status is not "Additional Documents Needed"
      setRequiredDocuments(['']);
    }
  }, [newStatus, requiredDocuments.length, setRequiredDocuments]);

  // Add a new document field
  const addDocumentField = () => {
    setRequiredDocuments([...requiredDocuments, '']);
    console.log('Added document field, now:', [...requiredDocuments, '']);
  };

  // Remove a document field
  const removeDocumentField = (index) => {
    const updatedDocuments = [...requiredDocuments];
    updatedDocuments.splice(index, 1);
    setRequiredDocuments(updatedDocuments);
    console.log('Removed document field, now:', updatedDocuments);
  };

  // Update a document field
  const updateDocumentField = (index, value) => {
    const updatedDocuments = [...requiredDocuments];
    updatedDocuments[index] = value;
    setRequiredDocuments(updatedDocuments);
    console.log('Updated document field, now:', updatedDocuments);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate that note is provided
    if (!statusNote || statusNote.trim() === '') {
      alert('Please provide a status note. This is required to update the application status.');
      return;
    }

    // Validate required documents if status is "Additional Documents Needed"
    if (newStatus === 'Additional Documents Needed') {
      const validDocuments = requiredDocuments.filter(doc => doc && doc.trim() !== '');
      if (validDocuments.length === 0) {
        alert('Please add at least one required document');
        return;
      }
    }

    // Call the parent component's handler
    handleStatusUpdate(e);
  };
  return (
    <div className="bg-white shadow overflow-hidden rounded-lg sticky top-20">
      <div className="px-4 py-5 sm:px-6 bg-[#b76e79] text-white">
        <h2 className="text-lg font-medium">Update Status</h2>
        <p className="mt-1 max-w-2xl text-sm text-white text-opacity-90">Change the application status Here.</p>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        {updateSuccess && (
          <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">Status updated successfully!</p>
              </div>
            </div>
          </div>
        )}

        {updateError && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{updateError}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#b76e79] focus:border-[#b76e79] sm:text-sm rounded-md"
                required
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="bg-gray-50 p-4 rounded-md border-l-4 border-[#b76e79]">
              <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                Status Note <span className="text-red-500">*</span>
              </label>
              <textarea
                id="note"
                name="note"
                rows={2}
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                className="shadow-sm focus:ring-[#b76e79] focus:border-[#b76e79] mt-2 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Add details about this status update. "
                required
              />


            </div>

            <div>
              <label htmlFor="tentativeDate" className="block text-sm font-medium text-gray-700">
                Tentative Next Update Date (Optional)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendarAlt className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="datetime-local"
                  name="tentativeDate"
                  id="tentativeDate"
                  value={tentativeDate}
                  onChange={(e) => setTentativeDate(e.target.value)}
                  className="focus:ring-[#b76e79] focus:border-[#b76e79] block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                When should the applicant check back for an update?
              </p>
            </div>

            {newStatus === 'Additional Documents Needed' && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Required Documents
                  </label>
                  <button
                    type="button"
                    onClick={addDocumentField}
                    className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <FaPlus className="h-3 w-3" aria-hidden="true" />
                  </button>
                </div>

                {requiredDocuments.map((doc, index) => (
                  <div key={index} className="mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex-grow relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaFileAlt className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name={`requiredDocument-${index}`}
                          id={`requiredDocument-${index}`}
                          value={doc}
                          onChange={(e) => updateDocumentField(index, e.target.value)}
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                          placeholder="e.g., Adhar Card, Passport, etc."
                          required={newStatus === 'Additional Documents Needed'}
                        />
                      </div>
                      {requiredDocuments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDocumentField(index)}
                          className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer"
                        >
                          <FaMinus className="h-3 w-3" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                    {index === 0 && (
                      <p className="mt-1 text-xs text-gray-500">
                        Specify which documents are needed from the applicant
                      </p>
                    )}
                  </div>
                ))}

                {requiredDocuments.length === 0 && (
                  <p className="text-sm text-gray-500 italic">
                    Click the + button to add required documents
                  </p>
                )}
              </div>
            )}



            <div>
              <button
                type="submit"
                disabled={isUpdating}
                className={`w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#b76e79] hover:bg-[#a25c67] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b76e79] transition-colors ${isUpdating ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {isUpdating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating Status...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Update Status
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StatusUpdateForm;
