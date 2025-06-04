import React from 'react';
import { useRouter } from 'next/router';

const DocumentChecklist = ({ selectedVisaType, filteredVisas, destination, setSelectedVisaType }) => {
  const router = useRouter();

  const handleApplyClick = () => {
    // Get the document checklist for the selected visa type
    const selectedVisa = filteredVisas[0];
    const documentChecklist = selectedVisa?.documentChecklist || [];

    // Encode the document checklist as a URL parameter
    const encodedDocumentChecklist = encodeURIComponent(JSON.stringify(documentChecklist));

    // Navigate to the apply page with the document checklist
    router.push(`/apply?destinationId=${destination.id}&destinationName=${destination.name}&visaType=${selectedVisaType}&documentChecklist=${encodedDocumentChecklist}`);
  };

  return (
    <div id="document-checklist-section" className="rounded-lg overflow-hidden p-4 sm:p-6 bg-gradient-to-br from-white to-gray-50">
      <div className="flex items-center justify-center mb-6 sm:mb-8">
        <svg className="h-8 w-8 text-[#b76e79] mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-center text-gray-700">
          Required Documents
        </h2>
      </div>

      {selectedVisaType !== "All" ? (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 transform transition-all duration-300 hover:shadow-xl">
            <div className="bg-[#b76e79] text-white px-5 py-4 flex items-center justify-between">
              <h3 className="text-lg md:text-xl font-semibold flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Document Checklist for {selectedVisaType} Visa
              </h3>
              <span className="bg-white text-[#b76e79] text-xs font-bold px-2 py-1 rounded-full">
                {filteredVisas[0]?.documentChecklist?.length || 0} Items
              </span>
            </div>

            <div className="p-5 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredVisas[0]?.documentChecklist?.map((document, index) => (
                  <div key={index} className="flex items-start bg-gray-50 p-3 rounded-lg border-l-4 border-[#b76e79] shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="bg-[#b76e79] rounded-full p-1 mr-3 text-white flex-shrink-0">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-gray-700 font-medium">{document}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <p className="text-gray-600 mb-4 text-sm">
                  Make sure you have all the required documents before proceeding with your application
                </p>
                <button
                  onClick={handleApplyClick}
                  className="bg-[#b76e79] text-white font-medium py-3 px-8 rounded-lg hover:bg-[#9a5a64] transition-colors shadow-md hover:shadow-lg flex items-center mx-auto"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Apply for {selectedVisaType} Visa
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center bg-white p-8 rounded-xl shadow-md max-w-2xl mx-auto">
          <svg className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600 mb-4">Please select a specific visa type to view the document checklist.</p>
          <div className="flex justify-center space-x-2">
            {["Tourist", "Work", "Student"].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedVisaType(type)}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300
                  bg-gray-100 text-gray-700 hover:bg-[#b76e79] hover:text-white
                  focus:outline-none focus:ring-2 focus:ring-[#b76e79] focus:ring-offset-2"
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentChecklist;
