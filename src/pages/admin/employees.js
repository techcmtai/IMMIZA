import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { FaUser, FaEnvelope, FaCalendarAlt, FaGlobe, FaPassport, FaPhone, FaSearch, FaUsers } from 'react-icons/fa';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';

export default function EmployeeManagement() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [groupedEmployees, setGroupedEmployees] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [countriesCount, setCountriesCount] = useState(0);

  // Fetch all employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching employees, user:', user ? `${user.username} (${user.role})` : 'No user');

        // Get token from localStorage as a fallback
        let authToken = '';
        if (typeof window !== 'undefined') {
          const userData = localStorage.getItem('user');
          if (userData) {
            try {
              const parsedUser = JSON.parse(userData);
              if (parsedUser && parsedUser.token) {
                // Ensure token is a string and not a Promise or object
                authToken = String(parsedUser.token);

                // Validate token format
                if (authToken === '[object Promise]' || authToken === '[object Object]' || authToken === 'undefined' || authToken === 'null') {
                  console.error('Invalid token format in localStorage:', authToken);
                  authToken = '';
                }
              }
            } catch (parseError) {
              console.error('Error parsing user data from localStorage:', parseError);
            }
          }
        }

        // Use token in query parameter for reliable authentication
        const url = authToken
          ? `/api/admin/employees?token=${encodeURIComponent(authToken)}`
          : '/api/admin/employees';

        console.log('Fetching employees with URL:', url.includes('token=') ? 'URL with token' : 'URL without token');

        const response = await axios.get(url, {
          headers: {
            'Cache-Control': 'no-cache',
            // Include token in Authorization header as a fallback
            ...(authToken && { 'Authorization': `Bearer ${authToken}` })
          },
          withCredentials: true // Include cookies in the request
        });

        if (response.data.success) {
          const employeesList = response.data.employees || [];
          const grouped = response.data.groupedEmployees || {};

          setEmployees(employeesList);
          setGroupedEmployees(grouped);
          setTotalCount(response.data.totalCount || 0);
          setCountriesCount(response.data.countriesCount || 0);
        } else {
          setError(response.data.message || 'Failed to fetch employees');
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
        if (error.response) {
          console.error('Server error response:', error.response.data);
          setError(`Server error: ${error.response.data.message || error.response.statusText}`);
        } else if (error.request) {
          console.error('No response received:', error.request);
          setError('No response from server. Please check your connection.');
        } else {
          setError(`Request error: ${error.message}`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchEmployees();
    } else if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  // Format date - handles both Firestore timestamps and ISO strings
  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';

    let date;

    // Check if it's a Firestore timestamp (has seconds and nanoseconds)
    if (dateValue && typeof dateValue === 'object' && dateValue.seconds !== undefined) {
      // Convert Firestore timestamp to JavaScript Date
      date = new Date(dateValue.seconds * 1000);
    } else {
      // Handle ISO string or other date format
      date = new Date(dateValue);
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.log('Invalid date:', dateValue);
      return 'Invalid Date';
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get visa type badge color
  const getVisaTypeBadgeColor = (visaType) => {
    switch (visaType) {
      case 'work':
        return 'bg-blue-100 text-blue-800';
      case 'tourist':
        return 'bg-green-100 text-green-800';
      case 'student':
        return 'bg-purple-100 text-purple-800';
      case 'unknown':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter countries based on search term
  const filteredCountries = Object.keys(groupedEmployees).filter(country =>
    country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get employees for selected country
  const getEmployeesForCountry = (country) => {
    if (!groupedEmployees[country]) return { work: [], tourist: [], student: [], unknown: [] };
    return groupedEmployees[country];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
            <p className="text-gray-600 mt-1">
              Total: {totalCount} employees across {countriesCount} countries
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-rose-500 focus:border-rose-500"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Countries List */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6 bg-gray-50 rounded-t-lg">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <FaGlobe className="mr-2" />
                    Countries ({filteredCountries.length})
                  </h2>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {filteredCountries.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No countries found</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {filteredCountries.map((country) => {
                        const countryData = groupedEmployees[country];
                        const totalEmployees = (countryData.work?.length || 0) +
                                             (countryData.tourist?.length || 0) +
                                             (countryData.student?.length || 0) +
                                             (countryData.unknown?.length || 0);

                        return (
                          <button
                            key={country}
                            onClick={() => setSelectedCountry(country)}
                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                              selectedCountry === country ? 'bg-rose-50 border-r-4 border-rose-500' : ''
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium text-gray-900">{country}</p>
                                <p className="text-sm text-gray-500">{totalEmployees} employees</p>
                              </div>
                              <div className="flex space-x-1">
                                {countryData.work?.length > 0 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    W: {countryData.work.length}
                                  </span>
                                )}
                                {countryData.tourist?.length > 0 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    T: {countryData.tourist.length}
                                  </span>
                                )}
                                {countryData.student?.length > 0 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    S: {countryData.student.length}
                                  </span>
                                )}
                                {countryData.unknown?.length > 0 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    U: {countryData.unknown.length}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Employee Details */}
            <div className="lg:col-span-2">
              {selectedCountry ? (
                <div className="space-y-6">
                  {/* Country Header */}
                  <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                      <FaGlobe className="mr-2 text-rose-500" />
                      {selectedCountry} Employees
                    </h2>
                  </div>

                  {/* Visa Type Sections */}
                  {['work', 'tourist', 'student', 'unknown'].map((visaType) => {
                    const employeesForVisa = getEmployeesForCountry(selectedCountry)[visaType] || [];

                    if (employeesForVisa.length === 0) return null;

                    return (
                      <div key={visaType} className="bg-white shadow rounded-lg">
                        <div className="px-4 py-5 sm:px-6 bg-gray-50 rounded-t-lg">
                          <h3 className="text-lg font-medium text-gray-900 flex items-center">
                            <FaPassport className="mr-2" />
                            {visaType.charAt(0).toUpperCase() + visaType.slice(1)} Visa
                            <span className="ml-2 text-sm text-gray-500">({employeesForVisa.length})</span>
                          </h3>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Employee
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Contact
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Joined Date
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {employeesForVisa.map((employee) => (
                                <tr key={employee.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                        <FaUser className="h-5 w-5 text-gray-500" />
                                      </div>
                                      <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">{employee.username}</div>
                                        <div className="text-sm text-gray-500">
                                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getVisaTypeBadgeColor(employee.visaType)}`}>
                                            {employee.visaType}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col">
                                      <div className="flex items-center text-sm text-gray-900">
                                        <FaEnvelope className="mr-2 text-gray-400" />
                                        {employee.email}
                                      </div>
                                      <div className="flex items-center text-sm text-gray-500 mt-1">
                                        <FaPhone className="mr-2 text-gray-400" />
                                        {employee.phoneNumber || 'N/A'}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center text-sm text-gray-500">
                                      <FaCalendarAlt className="mr-2 text-gray-400" />
                                      {formatDate(employee.createdAt)}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white shadow rounded-lg p-12 text-center">
                  <FaUsers className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Select a Country</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Choose a country from the list to view employees by visa type.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
