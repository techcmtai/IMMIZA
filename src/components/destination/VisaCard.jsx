import React from 'react';
import { useRouter } from 'next/router';

const VisaCard = ({ visa, destination }) => {
  const router = useRouter();

  const handleStartApplication = () => {
    // Get the document checklist for this visa type
    const documentChecklist = visa?.documentChecklist || [];

    // Encode the document checklist as a URL parameter
    const encodedDocumentChecklist = encodeURIComponent(JSON.stringify(documentChecklist));

    // Navigate to the apply page with the document checklist
    router.push(`/apply?destinationId=${destination.id}&destinationName=${destination.name}&visaType=${visa.type}&documentChecklist=${encodedDocumentChecklist}`);
  };

  return (
    <div
      className="border border-gray-300 rounded-lg overflow-hidden shadow-lg mx-auto"
      style={{ maxWidth: "750px" }}
    >
      {/* Header - Green with visa name */}
      <div className="bg-[#b76e79] text-white px-3 sm:px-4 py-1.5 sm:py-2">
        <h3 className="text-sm sm:text-lg font-semibold">{destination.name} {visa.name}</h3>
      </div>

      {/* Table-like layout for visa details */}
      <div className="px-3 sm:px-4 py-2 sm:py-3">
        <div className="grid grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm">
          <div className="text-gray-600 font-medium">Stay Duration</div>
          <div className="text-right">{visa.stay}</div>

          <div className="text-gray-600 font-medium">Visa Validity</div>
          <div className="text-right">{visa.validity}</div>

          <div className="text-gray-600 font-medium">Processing Time</div>
          <div className="text-right">{destination.processingTime}</div>
        </div>
      </div>

      {/* Footer with button and price */}
      <div className="flex flex-col sm:flex-row justify-between items-center px-3 sm:px-4 py-2 sm:py-3 bg-gray-100">
        <button
          onClick={handleStartApplication}
          className="bg-[#014421] text-white text-xs sm:text-sm font-medium py-1.5 sm:py-2 px-4 sm:px-6 rounded-lg hover:bg-[#1b2e24] transition-all duration-300 w-full sm:w-auto mb-2 sm:mb-0"
        >
          Start Application
        </button>
      </div>
    </div>
  );
};

export default VisaCard;
