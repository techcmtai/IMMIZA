import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { FaGoogle, FaFacebook, FaUser, FaUserTie, FaUserCog, FaChevronDown } from 'react-icons/fa';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState('user'); // 'user', 'agent', or 'employee'

  // Employee-specific fields
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedVisaType, setSelectedVisaType] = useState('');
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [existingEmployees, setExistingEmployees] = useState([]);

  const { register } = useAuth();

  // Fetch countries and existing employees when employee is selected
  useEffect(() => {
    if (userType === 'employee') {
      fetchCountries();
      fetchExistingEmployees();
    }
  }, [userType]);

  const fetchCountries = async () => {
    try {
      setLoadingCountries(true);
      const response = await fetch('/api/countries');
      const data = await response.json();

      if (data.success) {
        setCountries(data.countries);
      } else {
        setError('Failed to load countries');
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
      setError('Failed to load countries');
    } finally {
      setLoadingCountries(false);
    }
  };

  const fetchExistingEmployees = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();

      if (data.success) {
        const employees = data.data.filter(user => user.role === 'employee');
        setExistingEmployees(employees);
      }
    } catch (error) {
      console.error('Error fetching existing employees:', error);
    }
  };

  const handleVisaTypeSelect = (visaType) => {
    setSelectedVisaType(visaType);
  };

  // Check if a visa type is already taken for the selected country
  const isVisaTypeTaken = (visaType) => {
    if (!selectedCountry) return false;

    const selectedCountryName = countries.find(c => c.id === selectedCountry)?.name;
    if (!selectedCountryName) return false;

    return existingEmployees.some(employee =>
      employee.country === selectedCountryName &&
      employee.visaType &&
      employee.visaType.toLowerCase() === visaType.toLowerCase()
    );
  };

  // Get employee name who has taken this visa type for the selected country
  const getEmployeeForVisaType = (visaType) => {
    if (!selectedCountry) return null;

    const selectedCountryName = countries.find(c => c.id === selectedCountry)?.name;
    if (!selectedCountryName) return null;

    const employee = existingEmployees.find(emp =>
      emp.country === selectedCountryName &&
      emp.visaType &&
      emp.visaType.toLowerCase() === visaType.toLowerCase()
    );

    return employee ? employee.username : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation
    if (!username || !email || !phoneNumber || !password || !confirmPassword) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email');
      setIsLoading(false);
      return;
    }

    // Basic phone number validation
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError('Please enter a valid phone number');
      setIsLoading(false);
      return;
    }

    // Employee-specific validation
    if (userType === 'employee') {
      if (!selectedCountry) {
        setError('Please select a country');
        setIsLoading(false);
        return;
      }
      if (!selectedVisaType) {
        setError('Please select a visa type');
        setIsLoading(false);
        return;
      }

      // Check if this country + visa type combination is already taken
      try {
        const checkResponse = await fetch('/api/auth/check-employee-specialization', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            country: countries.find(c => c.id === selectedCountry)?.name,
            visaTypes: [selectedVisaType]
          }),
        });

        const checkData = await checkResponse.json();
        if (!checkData.success) {
          setError(checkData.message);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error checking specialization:', error);
        setError('Failed to validate specialization. Please try again.');
        setIsLoading(false);
        return;
      }
    }

    console.log('Submitting registration for:', email, 'as', userType);

    // Get country name for employee
    const selectedCountryName = userType === 'employee' && selectedCountry
      ? countries.find(c => c.id === selectedCountry)?.name
      : undefined;

    const result = await register(username, email, phoneNumber, password, userType, {
      country: userType === 'employee' ? selectedCountryName : undefined,
      visaTypes: userType === 'employee' ? [selectedVisaType] : undefined,
    });

    if (!result.success) {
      setError(result.message || 'Registration failed');
      setIsLoading(false);
    }

    // Note: We don't set isLoading to false on success because the page will redirect
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)] bg-white px-4 my-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex">
          <Link
            href="/login"
            className="flex-1 py-4 text-center font-medium bg-gray-100 text-gray-500 hover:bg-gray-200"
          >
            Login
          </Link>
          <button className="flex-1 py-4 text-center font-medium bg-white text-gray-800 border-b-2 border-[#b76e79]">
            Sign Up
          </button>
        </div>

        <div className="p-6">
          {/* User Type Selection */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">
              Sign up as
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUserType("user")}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border ${
                  userType === "user"
                    ? "bg-rose-50 border-[#b76e79] text-[#ae5361]"
                    : "border-gray-300 text-black hover:bg-gray-50"
                }`}
              >
                <FaUser className="text-xl mb-2" />
                <span className="font-medium text-sm">User</span>
                <p className="text-xs mt-1 text-gray-500 text-center">
                  Apply for visa services
                </p>
              </button>

              <button
                type="button"
                onClick={() => setUserType("agent")}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border ${
                  userType === "agent"
                    ? "bg-rose-50 border-[#b76e79] text-[#ae5361]"
                    : "border-gray-300 text-black hover:bg-gray-50"
                }`}
              >
                <FaUserTie className="text-xl mb-2" />
                <span className="font-medium text-sm">Agent</span>
                <p className="text-xs mt-1 text-gray-500 text-center">
                  Process visa applications
                </p>
              </button>

            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-rose-500 focus:border-rose-500"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-rose-500 focus:border-rose-500"
              />
            </div>

            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-rose-500 focus:border-rose-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-rose-500 focus:border-rose-500"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-rose-500 focus:border-rose-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#b76e79] hover:bg-[#774149] text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? "Creating account..." : "Sign Up"}
            </button>
          </form>


        </div>
      </div>
    </div>
  );
}
