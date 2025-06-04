import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { uploadFile } from '@/lib/storage-firebase';

const CountryManager = () => {
  const [countries, setCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    image: '',
    processingTime: '',
    issuedRecently: 0,
    category: [],
    visaInfo: [
      {
        type: 'Tourist',
        name: 'Tourist Visa',
        typeLabel: 'Tourist',
        stay: '',
        validity: '',
        documentChecklist: ['']
      },
      {
        type: 'Work',
        name: 'Work Visa',
        typeLabel: 'Work',
        stay: '',
        validity: '',
        documentChecklist: ['']
      },
      {
        type: 'Student',
        name: 'Student Visa',
        typeLabel: 'Student',
        stay: '',
        validity: '',
        documentChecklist: ['']
      }
    ]
  });

  // Fetch countries from Firebase
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const countriesCollection = collection(db, 'countries');
        const countrySnapshot = await getDocs(countriesCollection);
        const countryList = countrySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCountries(countryList);
        setFilteredCountries(countryList);
      } catch (err) {
        console.error('Error fetching countries:', err);
        setError('Failed to load countries. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // Filter countries based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCountries(countries);
    } else {
      const filtered = countries.filter(country =>
        country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (country.category && country.category.some(cat =>
          cat.toLowerCase().includes(searchTerm.toLowerCase())
        )) ||
        country.processingTime.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCountries(filtered);
    }
  }, [searchTerm, countries]);

  // Handle selecting a country to edit
  const handleSelectCountry = (country) => {
    setSelectedCountry(country);
    setFormData(country);
    setIsEditing(true);
  };

  // Handle creating a new country
  const handleCreateNew = () => {
    setSelectedCountry(null);
    setFormData({
      id: Date.now().toString(), // Generate a temporary ID
      name: '',
      image: '',
      processingTime: '',
      issuedRecently: 0,
      category: [],
      visaInfo: [
        {
          type: 'Tourist',
          name: 'Tourist Visa',
          typeLabel: 'Tourist',
          stay: '',
          validity: '',
          documentChecklist: ['']
        },
        {
          type: 'Work',
          name: 'Work Visa',
          typeLabel: 'Work',
          stay: '',
          validity: '',
          documentChecklist: ['']
        },
        {
          type: 'Student',
          name: 'Student Visa',
          typeLabel: 'Student',
          stay: '',
          validity: '',
          documentChecklist: ['']
        }
      ]
    });
    setIsEditing(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle category changes
  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setFormData({
        ...formData,
        category: [...formData.category, value]
      });
    } else {
      setFormData({
        ...formData,
        category: formData.category.filter(cat => cat !== value)
      });
    }
  };

  // Handle visa info changes
  const handleVisaInfoChange = (index, field, value) => {
    const updatedVisaInfo = [...formData.visaInfo];
    updatedVisaInfo[index] = {
      ...updatedVisaInfo[index],
      [field]: value
    };
    setFormData({
      ...formData,
      visaInfo: updatedVisaInfo
    });
  };

  // Handle document checklist changes
  const handleDocumentChecklistChange = (visaIndex, docIndex, value) => {
    const updatedVisaInfo = [...formData.visaInfo];
    const updatedChecklist = [...updatedVisaInfo[visaIndex].documentChecklist];
    updatedChecklist[docIndex] = value;
    updatedVisaInfo[visaIndex] = {
      ...updatedVisaInfo[visaIndex],
      documentChecklist: updatedChecklist
    };
    setFormData({
      ...formData,
      visaInfo: updatedVisaInfo
    });
  };

  // Add a new document to checklist
  const handleAddDocument = (visaIndex) => {
    const updatedVisaInfo = [...formData.visaInfo];
    updatedVisaInfo[visaIndex] = {
      ...updatedVisaInfo[visaIndex],
      documentChecklist: [...updatedVisaInfo[visaIndex].documentChecklist, '']
    };
    setFormData({
      ...formData,
      visaInfo: updatedVisaInfo
    });
  };

  // Remove a document from checklist
  const handleRemoveDocument = (visaIndex, docIndex) => {
    const updatedVisaInfo = [...formData.visaInfo];
    const updatedChecklist = [...updatedVisaInfo[visaIndex].documentChecklist];
    updatedChecklist.splice(docIndex, 1);
    updatedVisaInfo[visaIndex] = {
      ...updatedVisaInfo[visaIndex],
      documentChecklist: updatedChecklist
    };
    setFormData({
      ...formData,
      visaInfo: updatedVisaInfo
    });
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const result = await uploadFile(file, 'country-images');
      if (result.success) {
        setFormData({
          ...formData,
          image: result.url
        });
      } else {
        setError('Failed to upload image. Please try again.');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Save country to Firebase
  const handleSave = async () => {
    try {
      setLoading(true);

      // Prepare the data in the exact format needed
      const countryData = {
        name: formData.name,
        image: formData.image,
        processingTime: formData.processingTime,
        issuedRecently: Number(formData.issuedRecently),
        category: formData.category,
        visaInfo: formData.visaInfo.map(visa => ({
          type: visa.type,
          name: visa.name,
          typeLabel: visa.typeLabel,
          stay: visa.stay,
          validity: visa.validity,
          documentChecklist: visa.documentChecklist
        }))
      };

      const countryRef = doc(db, 'countries', formData.id);
      await setDoc(countryRef, countryData);

      // Update local state
      const updatedFormData = {
        ...formData,
        visaInfo: countryData.visaInfo
      };

      const updatedCountries = selectedCountry
        ? countries.map(country => country.id === formData.id ? updatedFormData : country)
        : [...countries, updatedFormData];

      setCountries(updatedCountries);
      setFilteredCountries(updatedCountries);
      setIsEditing(false);
      setSelectedCountry(null);
      alert('Country saved successfully!');
    } catch (err) {
      console.error('Error saving country:', err);
      setError('Failed to save country. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete country from Firebase
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this country?')) return;

    try {
      setLoading(true);
      await deleteDoc(doc(db, 'countries', id));

      // Update local state
      const updatedCountries = countries.filter(country => country.id !== id);
      setCountries(updatedCountries);
      setFilteredCountries(updatedCountries);
      setIsEditing(false);
      setSelectedCountry(null);
      alert('Country deleted successfully!');
    } catch (err) {
      console.error('Error deleting country:', err);
      setError('Failed to delete country. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setIsEditing(false);
    setSelectedCountry(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {!isEditing ? (
        <div>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-xl font-semibold">Countries</h2>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                  </svg>
                </div>
                <input
                  type="search"
                  className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-[#b76e79] focus:border-[#b76e79]"
                  placeholder="Search countries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <button
                onClick={handleCreateNew}
                className="bg-[#b76e79] text-white px-4 py-2.5 rounded-lg hover:bg-[#a25c67] transition-colors w-full sm:w-auto"
              >
                Add New Country
              </button>
            </div>
          </div>

          <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Processing Time</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categories</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#b76e79]"></div>
                        <span className="ml-2 text-gray-600">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredCountries.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-8">
                      {searchTerm ? (
                        <div className="text-gray-500">
                          <p>No countries found matching "{searchTerm}"</p>
                          <button
                            onClick={() => setSearchTerm('')}
                            className="text-[#b76e79] hover:underline mt-2"
                          >
                            Clear search
                          </button>
                        </div>
                      ) : (
                        <div className="text-gray-500">
                          <p>No countries found. Add your first country!</p>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredCountries.map((country) => (
                    <tr key={country.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{country.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{country.processingTime}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex flex-wrap gap-1">
                          {country.category?.map(cat => (
                            <span key={cat} className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleSelectCountry(country)}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(country.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">
              {selectedCountry ? `Edit ${selectedCountry.name}` : 'Add New Country'}
            </h3>
            <button
              onClick={handleCancel}
              className="text-gray-600 hover:text-gray-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Processing Time
              </label>
              <input
                type="text"
                name="processingTime"
                value={formData.processingTime}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder="e.g. 5 days"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issued Recently
              </label>
              <input
                type="number"
                name="issuedRecently"
                value={formData.issuedRecently}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full p-2 border rounded"
              />
              {formData.image && (
                <div className="mt-2">
                  <img
                    src={formData.image}
                    alt="Country preview"
                    className="h-20 w-auto object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categories
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {['popular', 'easy', 'week', 'schengen', 'free'].map((category) => (
                <div key={category} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`category-${category}`}
                    value={category}
                    checked={formData.category?.includes(category)}
                    onChange={handleCategoryChange}
                    className="mr-2"
                  />
                  <label htmlFor={`category-${category}`} className="text-sm">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <h4 className="text-lg font-medium mb-2 mt-6">Visa Information</h4>

          {formData.visaInfo.map((visa, visaIndex) => (
            <div key={visaIndex} className="border p-4 rounded mb-4">
              <h5 className="font-medium mb-2">{visa.type} Visa</h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stay Duration
                  </label>
                  <input
                    type="text"
                    value={visa.stay}
                    onChange={(e) => handleVisaInfoChange(visaIndex, 'stay', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="e.g. 30 days"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Validity
                  </label>
                  <input
                    type="text"
                    value={visa.validity}
                    onChange={(e) => handleVisaInfoChange(visaIndex, 'validity', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="e.g. 90 days"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Checklist
                </label>
                {visa.documentChecklist.map((doc, docIndex) => (
                  <div key={docIndex} className="flex items-center mb-2">
                    <input
                      type="text"
                      value={doc}
                      onChange={(e) => handleDocumentChecklistChange(visaIndex, docIndex, e.target.value)}
                      className="flex-grow p-2 border rounded mr-2"
                      placeholder="Document requirement"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveDocument(visaIndex, docIndex)}
                      className="text-red-600 hover:text-red-800"
                      disabled={visa.documentChecklist.length <= 1}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddDocument(visaIndex)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add Document
                </button>
              </div>
            </div>
          ))}

          <div className="flex justify-end mt-8">
            <button
              onClick={handleCancel}
              className="bg-gray-200 text-gray-800 px-5 py-2.5 rounded-lg mr-3 hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-[#b76e79] text-white px-5 py-2.5 rounded-lg hover:bg-[#a25c67] transition-colors font-medium flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Save Country
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountryManager;
