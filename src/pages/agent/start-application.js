import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import VisaApplicationForm from '@/components/agent/VisaApplicationForm';
import AgentLayout from '@/components/agent/AgentLayout';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export default function ApplyPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [visaTypes, setVisaTypes] = useState([]);
  const [selectedVisaType, setSelectedVisaType] = useState('');
  const [documentChecklist, setDocumentChecklist] = useState([]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Fetch countries on mount
  useEffect(() => {
    async function fetchCountries() {
      const countriesCollection = collection(db, 'countries');
      const countrySnapshot = await getDocs(countriesCollection);
      const countryList = countrySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCountries(countryList);
    }
    fetchCountries();
  }, []);

  // Fetch visa types when country changes
  useEffect(() => {
    if (selectedCountry) {
      const country = countries.find(c => c.id === selectedCountry);
      setVisaTypes(country?.visaInfo?.map(v => v.type) || []);
    } else {
      setVisaTypes([]);
    }
    setSelectedVisaType('');
    setDocumentChecklist([]);
  }, [selectedCountry, countries]);

  // Fetch checklist when visa type changes
  useEffect(() => {
    async function fetchChecklist() {
      if (selectedCountry && selectedVisaType) {
        const countryRef = doc(db, 'countries', selectedCountry);
        const countrySnap = await getDoc(countryRef);
        if (countrySnap.exists()) {
          const countryData = countrySnap.data();
          const visaInfo = countryData.visaInfo?.find(v => v.type === selectedVisaType);
          if (visaInfo && visaInfo.documentChecklist) {
            setDocumentChecklist(visaInfo.documentChecklist);
          } else {
            setDocumentChecklist([]);
          }
        }
      } else {
        setDocumentChecklist([]);
      }
    }
    fetchChecklist();
  }, [selectedCountry, selectedVisaType]);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const destinationName = countries.find(c => c.id === selectedCountry)?.name;

  console.log('countries:', countries);
  console.log('selectedCountry:', selectedCountry, typeof selectedCountry);
  console.log('countries ids:', countries.map(c => [c.id, typeof c.id]));
  console.log('selectedVisaType:', selectedVisaType, typeof selectedVisaType);
  console.log('destinationName:', countries.find(c => c.id === selectedCountry)?.name);

  return (
    <AgentLayout>
      <div className="min-h-screen bg-gray-50 py-8 px-2 mt-20 md:mt-20">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="mb-6 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
          >
            ← Back
          </button>
          <h2 className="text-2xl font-bold mb-6 text-center">Start Visa Application</h2>
          {/* Step 1: Select Country, Visa Type */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <select
                className="w-full border rounded-md px-3 py-2"
                value={selectedCountry}
                onChange={e => setSelectedCountry(e.target.value)}
              >
                <option value="">Select Country</option>
                {countries.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visa Type</label>
              <select
                className="w-full border rounded-md px-3 py-2"
                value={selectedVisaType}
                onChange={e => setSelectedVisaType(e.target.value)}
                disabled={!selectedCountry || visaTypes.length === 0}
              >
                <option value="">Select Visa Type</option>
                {visaTypes.filter(type => type.toLowerCase() !== 'work').map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
          {/* Checklist Preview */}
          {(selectedCountry && selectedVisaType) && (
            <div className="mb-8 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Required Documents</h3>
              {documentChecklist.length > 0 ? (
                <>
                  <ul className="list-disc pl-5 text-gray-700 mb-4">
                    <li>
                      If you do not have a document, please <a href="https://wa.me/919053603098" className="text-rose-500 underline" target="_blank" rel="noopener noreferrer">contact us</a>.
                    </li>
                    {documentChecklist.map((doc, idx) => (
                      <li key={idx}>{doc}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
                  <p className="text-gray-500 italic mb-2">No specific documents are required for this visa type.</p>
                  <ul className="list-disc pl-5 text-gray-700 mb-4">
                    <li>Passport Photo</li>
                    <li>Passport Front</li>
                  </ul>
                </>
              )}
            </div>
          )}
          {/* Full Application Form (single step) */}
          {(selectedCountry && selectedVisaType && destinationName) && (
            <VisaApplicationForm
              destinationId={selectedCountry}
              destinationName={destinationName}
              visaType={selectedVisaType}
              propDocumentChecklist={documentChecklist}
            />
          )}
        </div>
      </div>
    </AgentLayout>
  );
}
