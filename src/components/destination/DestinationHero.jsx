import React from 'react';
import Image from 'next/image';

const DestinationHero = ({ destination, formattedDate }) => {
  return (
    <div className="rounded-2xl overflow-hidden px-4 sm:px-8 md:px-12 lg:px-24 py-6 md:py-12">
      <div className="flex flex-col md:flex-row w-full relative">
        {/* Left Side - Image */}
        <div className="w-full md:w-1/2 relative mb-6 md:mb-0">
          <div className="relative w-full h-56 sm:h-64 md:h-72 rounded-2xl overflow-hidden">
            <Image
              src={destination.image}
              alt={destination.name}
              fill
              style={{ objectFit: 'cover' }}
              onError={(e) => {
                // Next/image doesn't support onError the same way as img
                // This is a fallback but may not work as expected
                const imgElement = e.target;
                if (imgElement) {
                  imgElement.src = "https://via.placeholder.com/1200x600?text=Image+Not+Found";
                }
              }}
            />
          </div>
        </div>

        {/* Right Side - Text */}
        <div className="w-full md:w-1/2 flex flex-col justify-center p-4 md:p-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-800">
            {destination.name} Visa
          </h1>
          <p className="text-base sm:text-lg text-center text-gray-600 mb-4">
            Apply for your visa online quickly and easily.
          </p>

          {/* Visa Details */}
          <div className="text-center mt-4">
            <div className="bg-[#014421] text-white py-1.5 sm:py-2 font-semibold text-xs sm:text-sm md:text-base inline-block px-3 sm:px-4 rounded-full">
              Get your visa by {formattedDate}, if you apply today
            </div>
          </div>

          {/* Contact Section */}
          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-xs sm:text-sm text-gray-600">Talk to a visa expert - Call now</p>
            <a
              href="tel:+918045680800"
              className="inline-flex items-center justify-center bg-[#b76e79] hover:bg-[#9a5a64] text-white py-1.5 sm:py-2 px-4 sm:px-6 rounded-lg mt-2 text-sm sm:text-base"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call +918045680800
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationHero;
