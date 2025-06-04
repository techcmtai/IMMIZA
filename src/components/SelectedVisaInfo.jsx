import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const SelectedVisaInfo = () => {
  const [countryName, setCountryName] = useState('');
  const [countryId, setCountryId] = useState('');
  const [visaType, setVisaType] = useState('');
  const [hasSelection, setHasSelection] = useState(false);

  useEffect(() => {
    // Get selected country and visa type from localStorage
    if (typeof window !== 'undefined') {
      const storedCountryName = localStorage.getItem('selectedCountryName');
      const storedCountryId = localStorage.getItem('selectedCountry');
      const storedVisaType = localStorage.getItem('selectedVisaType');

      console.log('Retrieved from localStorage:', {
        storedCountryName,
        storedCountryId,
        storedVisaType
      });

      if (storedCountryName && storedVisaType && storedCountryId) {
        setCountryName(storedCountryName);
        setCountryId(storedCountryId);
        setVisaType(storedVisaType);
        setHasSelection(true);

        console.log('Set state with values:', {
          countryName: storedCountryName,
          countryId: storedCountryId,
          visaType: storedVisaType
        });
      }
    }
  }, []);

  if (!hasSelection) return null;

  return (
    <div className="bg-gray-50 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center bg-white rounded-lg shadow-md p-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Your Selected Visa
            </h3>
            <p className="text-gray-600">
              You have selected a <span className="font-medium">{visaType} Visa</span> for <span className="font-medium">{countryName}</span>
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              href={`/destination/${countryId}`}
              className="inline-flex items-center px-4 py-2 bg-[#b76e79] text-white rounded-md hover:bg-[#a25c67] transition-colors"
              onClick={(e) => {
                console.log('Link clicked, navigating to:', `/destination/${countryId}`);
                // Add a fallback in case Next.js Link doesn't work
                if (typeof window !== 'undefined' && countryId) {
                  // Let the Link component handle it normally
                  // This is just a debug log
                  console.log('Using Link navigation');
                }
              }}
            >
              View Document Checklist
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectedVisaInfo;
