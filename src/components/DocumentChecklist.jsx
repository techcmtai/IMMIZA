import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const DocumentChecklist = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documentChecklist, setDocumentChecklist] = useState([]);
  const [country, setCountry] = useState(null);
  const [visaType, setVisaType] = useState(null);

  useEffect(() => {
    // Get selected country and visa type from localStorage
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get data from localStorage
        const countryId = localStorage.getItem('selectedCountry');
        const visaType = localStorage.getItem('selectedVisaType');
        const countryName = localStorage.getItem('selectedCountryName');

        if (!countryId || !visaType) {
          setError('No country or visa type selected');
          setLoading(false);
          return;
        }

        setVisaType(visaType);

        // Fetch country data from Firebase
        const countryRef = doc(db, 'countries', countryId);
        const countrySnap = await getDoc(countryRef);

        if (countrySnap.exists()) {
          const countryData = {
            id: countrySnap.id,
            ...countrySnap.data()
          };
          setCountry(countryData);

          // Find the visa info for the selected visa type
          const visaInfo = countryData.visaInfo?.find(v => v.type === visaType);

          if (visaInfo && visaInfo.documentChecklist) {
            setDocumentChecklist(visaInfo.documentChecklist);
          } else {
            setDocumentChecklist([]);
          }
        } else {
          setError('Country not found');
        }
      } catch (err) {
        console.error('Error fetching document checklist:', err);
        setError('Failed to load document checklist. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#b76e79]"></div>
        <span className="ml-2 text-gray-600">Loading checklist...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {country && visaType && (
        <div className="bg-[#fdf0f2] border-l-4 border-[#b76e79] p-4 mb-6">
          <p className="text-[#b76e79] font-medium">
            Document Checklist for {visaType} Visa to {country.name}
          </p>
        </div>
      )}

      {documentChecklist.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documentChecklist.map((document, index) => (
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
      ) : (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-2 text-gray-500">No document checklist available for this visa type.</p>
        </div>
      )}
    </div>
  );
};

export default DocumentChecklist;
