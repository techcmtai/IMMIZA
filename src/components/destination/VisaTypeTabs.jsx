import React from 'react';

const VisaTypeTabs = ({ selectedVisaType, setSelectedVisaType, destinationName }) => {
  return (
    <div>
      {/* Visa Type Tabs */}
      <div className="flex justify-center mb-6 sm:mb-8 overflow-x-auto pb-2">
        <div className="bg-gray-100 p-1 rounded-xl shadow-md flex space-x-2 sm:space-x-4">
          {["All", "Tourist", "Student"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedVisaType(type)}
              className={`px-3 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-300 whitespace-nowrap
                ${selectedVisaType === type
                  ? "bg-[#b76e79] text-white shadow-lg"
                  : "text-gray-700 hover:bg-white hover:shadow-sm"}
                focus:outline-none focus:ring-2 focus:ring-[#b76e79] focus:ring-offset-2`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-center text-gray-700 mb-6 sm:mb-8">
        {destinationName} Visa Types
      </h2>
    </div>
  );
};

export default VisaTypeTabs;
