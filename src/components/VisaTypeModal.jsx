import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FaPlane, FaBriefcase, FaGraduationCap, FaChevronDown } from 'react-icons/fa';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

const VisaTypeModal = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { user, updateUserData } = useAuth();
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedVisaType, setSelectedVisaType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documentChecklist, setDocumentChecklist] = useState([]);
  const [step, setStep] = useState(1); // 1: Country selection, 2: Visa type selection, 3: View checklist

  // Fetch countries from Firebase
  useEffect(() => {
    if (!isOpen) return;

    console.log('VisaTypeModal is open, fetching countries');

    const fetchCountries = async () => {
      try {
        setLoading(true);
        const countriesCollection = collection(db, 'countries');
        const countrySnapshot = await getDocs(countriesCollection);
        const countryList = countrySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Sort countries alphabetically by name
        const sortedCountries = countryList.sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        console.log(`Fetched ${sortedCountries.length} countries`);
        setCountries(sortedCountries);
        setError(null);
      } catch (err) {
        console.error('Error fetching countries:', err);
        setError('Failed to load countries. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, [isOpen]);

  // Debug log when modal visibility changes
  useEffect(() => {
    console.log('VisaTypeModal isOpen state changed:', isOpen);
  }, [isOpen]);

  // Handle country selection
  const handleCountrySelect = (e) => {
    const countryId = e.target.value;
    setSelectedCountry(countryId);
    console.log('Country selected:', countryId);

    // Reset visa type when country changes
    setSelectedVisaType('');
    setDocumentChecklist([]);
  };

  // Handle visa type selection
  const handleVisaTypeSelect = (visaType) => {
    setSelectedVisaType(visaType);

    // Find the selected country and visa type to get document checklist
    const country = countries.find(c => c.id === selectedCountry);
    if (country) {
      const visaInfo = country.visaInfo.find(v => v.type === visaType);
      if (visaInfo && visaInfo.documentChecklist) {
        setDocumentChecklist(visaInfo.documentChecklist);
      } else {
        setDocumentChecklist([]);
      }
    }
  };

  // Handle view checklist button click
  const handleViewChecklist = async () => {
    console.log('View Checklist button clicked');

    // Get the selected country name
    const selectedCountryName = countries.find(c => c.id === selectedCountry)?.name || '';

    // Store selections in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedCountry', selectedCountry);
      localStorage.setItem('selectedCountryName', selectedCountryName);
      localStorage.setItem('selectedVisaType', selectedVisaType);

      // Set flag to indicate user has made a selection
      localStorage.setItem('hasSelectedVisa', 'true');

      // If this is a new user, remove the isNewUser flag from localStorage
      // to prevent showing the modal again on subsequent logins
      const localUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (localUser.isNewUser) {
        console.log('Updating isNewUser flag to false for user:', localUser.username);
        localUser.isNewUser = false;
        localStorage.setItem('user', JSON.stringify(localUser));
      }

      // Debug log
      console.log('Stored in localStorage:', {
        selectedCountry,
        selectedCountryName,
        selectedVisaType,
        hasSelectedVisa: true
      });
    }

    // Save preferences to Firebase if user is logged in
    if (user && user.id) {
      try {
        console.log('Saving user preferences to Firebase for user:', user.id);

        // Call the API to update user preferences
        const response = await axios.post('/api/user/update-preferences', {
          userId: user.id,
          selectedCountry,
          selectedCountryName,
          selectedVisaType
        });

        if (response.data.success) {
          console.log('User preferences saved to Firebase successfully');

          // Update the user data in context if needed
          if (user.isNewUser) {
            updateUserData({
              isNewUser: false,
              preferences: {
                selectedCountry,
                selectedCountryName,
                selectedVisaType
              }
            });
          }
        } else {
          console.error('Failed to save user preferences to Firebase:', response.data.message);
        }
      } catch (error) {
        console.error('Error saving user preferences to Firebase:', error);
      }
    } else {
      console.log('User not logged in, preferences only saved to localStorage');
    }

    // Close the modal
    console.log('Closing modal');
    onClose();

    // Debug log
    console.log('Redirecting to:', `/destination/${selectedCountry}`);

    // Redirect to the destination page with the selected country ID
    // Add a small delay before redirecting to ensure the modal is closed properly
    setTimeout(() => {
      try {
        console.log('Executing router.push');
        router.push(`/destination/${selectedCountry}`);
      } catch (error) {
        console.error('Error during redirection:', error);

        // Fallback approach using window.location
        if (typeof window !== 'undefined') {
          console.log('Using fallback redirection method');
          window.location.href = `/destination/${selectedCountry}`;
        }
      }
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-[10000]">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-2xl leading-6 font-bold text-gray-900 mb-2 text-center">
                  Immigration Services
                </h3>

                {/* Country Selection */}
                <div className="mb-6 mt-8">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Choose Country
                  </h4>
                  <div className="relative">
                    <select
                      value={selectedCountry}
                      onChange={handleCountrySelect}
                      className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[#b76e79] focus:border-[#b76e79] appearance-none"
                      disabled={loading}
                    >
                      <option value="">Country</option>
                      {countries.map((country) => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <FaChevronDown className="text-gray-400" />
                    </div>
                  </div>
                  {loading && (
                    <p className="text-sm text-gray-500 mt-2">
                      Loading countries...
                    </p>
                  )}
                  {error && (
                    <p className="text-sm text-red-500 mt-2">{error}</p>
                  )}
                </div>

                {/* Visa Type Selection */}
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Select Purpose
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    {/* Study Visa */}
                    <div
                      onClick={() => handleVisaTypeSelect("Student")}
                      className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all duration-300 cursor-pointer ${
                        selectedVisaType === "Student"
                          ? "border-[#b76e79] bg-[#333333] text-white"
                          : "border-gray-200 hover:border-[#b76e79] bg-white text-gray-900"
                      }`}
                    >
                      <h4 className="font-medium">Study</h4>
                    </div>

                    {/* Work Visa */}
                    {/* <div
                      onClick={() => handleVisaTypeSelect("Work")}
                      className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all duration-300 cursor-pointer ${
                        selectedVisaType === "Work"
                          ? "border-[#b76e79] bg-white text-gray-900"
                          : "border-gray-200 hover:border-[#b76e79] bg-white text-gray-900"
                      }`}
                    >
                      <h4 className="font-medium">Work</h4>
                    </div> */}

                    {/* Tourist Visa */}
                    <div
                      onClick={() => handleVisaTypeSelect("Tourist")}
                      className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all duration-300 cursor-pointer ${
                        selectedVisaType === "Tourist"
                          ? "border-[#b76e79] bg-white text-gray-900"
                          : "border-gray-200 hover:border-[#b76e79] bg-white text-gray-900"
                      }`}
                    >
                      <h4 className="font-medium">Tourist</h4>
                    </div>
                  </div>
                </div>

                {/* View Checklist Button */}
                <div className="mt-8">
                  <button
                    onClick={handleViewChecklist}
                    disabled={!selectedCountry || !selectedVisaType}
                    className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                      selectedCountry && selectedVisaType
                        ? "bg-[#b76e79] hover:bg-[#95525c]"
                        : "bg-gray-300 cursor-not-allowed"
                    }`}
                  >
                    View Checklist
                  </button>

                  {/* Direct link as fallback */}
                  {selectedCountry && selectedVisaType && (
                    <div className="mt-2 text-center">
                      <a
                        href="#"
                        className="text-xs text-gray-500 hover:underline"
                        onClick={async (e) => {
                          e.preventDefault(); // Prevent default navigation
                          console.log("Direct link clicked");

                          // Get the selected country name
                          const selectedCountryName =
                            countries.find((c) => c.id === selectedCountry)
                              ?.name || "";

                          // Store data in localStorage before navigating
                          if (typeof window !== "undefined") {
                            localStorage.setItem(
                              "selectedCountry",
                              selectedCountry
                            );
                            localStorage.setItem(
                              "selectedCountryName",
                              selectedCountryName
                            );
                            localStorage.setItem(
                              "selectedVisaType",
                              selectedVisaType
                            );
                            localStorage.setItem("hasSelectedVisa", "true");

                            // If this is a new user, remove the isNewUser flag from localStorage
                            const localUser = JSON.parse(
                              localStorage.getItem("user") || "{}"
                            );
                            if (localUser.isNewUser) {
                              console.log(
                                "Updating isNewUser flag to false for user:",
                                localUser.username
                              );
                              localUser.isNewUser = false;
                              localStorage.setItem(
                                "user",
                                JSON.stringify(localUser)
                              );
                            }

                            console.log(
                              "Direct link clicked, stored data in localStorage with hasSelectedVisa flag"
                            );
                          }

                          // Save preferences to Firebase if user is logged in
                          if (user && user.id) {
                            try {
                              console.log(
                                "Saving user preferences to Firebase for user:",
                                user.id
                              );

                              // Call the API to update user preferences
                              const response = await axios.post(
                                "/api/user/update-preferences",
                                {
                                  userId: user.id,
                                  selectedCountry,
                                  selectedCountryName,
                                  selectedVisaType,
                                }
                              );

                              if (response.data.success) {
                                console.log(
                                  "User preferences saved to Firebase successfully"
                                );

                                // Update the user data in context if needed
                                if (user.isNewUser) {
                                  updateUserData({
                                    isNewUser: false,
                                    preferences: {
                                      selectedCountry,
                                      selectedCountryName,
                                      selectedVisaType,
                                    },
                                  });
                                }
                              } else {
                                console.error(
                                  "Failed to save user preferences to Firebase:",
                                  response.data.message
                                );
                              }
                            } catch (error) {
                              console.error(
                                "Error saving user preferences to Firebase:",
                                error
                              );
                            }
                          } else {
                            console.log(
                              "User not logged in, preferences only saved to localStorage"
                            );
                          }

                          // Close the modal
                          console.log("Closing modal from direct link");
                          onClose();

                          // Add a small delay before redirecting
                          setTimeout(() => {
                            console.log(
                              "Redirecting to destination page from direct link"
                            );
                            router.push(`/destination/${selectedCountry}`);
                          }, 100);
                        }}
                      >
                        If button doesn't work, click here
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisaTypeModal;
