import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import {
  FaCommentAlt,
  FaUserCircle,
  FaWhatsapp,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaTachometerAlt,
  FaInfoCircle
} from 'react-icons/fa';

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [router.pathname]);

  // Handle logo click based on user role
  const handleLogoClick = (e) => {
    if (user && user.role === 'admin') {
      e.preventDefault();
      router.push('/admin');
    } else if (user && user.role === 'agent') {
      e.preventDefault();
      router.push('/agent');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white py-4 shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" onClick={handleLogoClick} className="flex items-center space-x-2">
  <img src="/images/logo.png" alt="IMMIZA Logo" className="h-9 w-9" />
  <span className="text-3xl font-bold text-black"> IMMIZA</span>
</Link>

          </div>

          {/* Desktop Auth buttons */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {user ? (
              <>
                {user.role === 'admin' ? (
                  // Admin users
                  <div className="flex items-center space-x-4">

                    <Link
                      href="/admin"
                      className="text-gray-700 hover:text-gray-900 font-medium flex items-center"
                    >
                      <FaTachometerAlt className="mr-2 text-gray-500" />
                      Admin Dashboard
                    </Link>
                    <button
                      onClick={logout}
                      className="text-gray-700 hover:text-gray-900 font-medium flex items-center cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-md transition-colors"
                    >
                      <FaSignOutAlt className="mr-2 text-gray-500" />
                      Logout
                    </button>
                  </div>
                ) : user.role === 'agent' ? (
                  // Agent users
                  <div className="flex items-center space-x-4">
                    <Link
                      href="/agent"
                      className="text-gray-700 hover:text-gray-900 font-medium flex items-center"
                    >
                      <FaTachometerAlt className="mr-2 text-gray-500" />
                      Agent Dashboard
                    </Link>
                    <button
                      onClick={logout}
                      className="text-gray-700 hover:text-gray-900 font-medium flex items-center cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-md transition-colors"
                    >
                      <FaSignOutAlt className="mr-2 text-gray-500" />
                      Logout
                    </button>
                  </div>
                ) : user.role === 'employee' ? (
                  // Employee users
                  <div className="flex items-center space-x-4">
                    <Link
                      href="/employee"
                      className="text-gray-700 hover:text-gray-900 font-medium flex items-center"
                    >
                      <FaTachometerAlt className="mr-2 text-gray-500" />
                      Employee Dashboard
                    </Link>
                    <button
                      onClick={logout}
                      className="text-gray-700 hover:text-gray-900 font-medium flex items-center cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-md transition-colors"
                    >
                      <FaSignOutAlt className="mr-2 text-gray-500" />
                      Logout
                    </button>
                  </div>
                ) : (
                  // Regular users with dropdown and WhatsApp button
                  <div className="flex items-center space-x-4">
                    {/* About Us Link */}
                    <Link
                      href="/about"
                      className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                    >
                      <FaInfoCircle className="text-lg" />
                      <span>About Us</span>
                    </Link>

                    {/* WhatsApp Contact Button */}
                    <a
                      href="https://wa.me/919053603098"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2"
                    >
                      <FaWhatsapp className="text-xl" />
                      <span>Contact Us</span>
                    </a>

                    {/* User Dropdown */}
                    <div className="relative user-dropdown">
                      <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center text-gray-700 hover:text-gray-900 font-medium focus:outline-none"
                      >
                        <FaUserCircle className="h-5 w-5 text-gray-600 mr-2" />
                        <span>{user.username}</span>
                        <svg
                          className={`ml-1 h-4 w-4 transform ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>

                      {/* Dropdown menu for regular users */}
                      {isDropdownOpen && (
                        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10">
                          <Link
                            href="/dashboard"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <div className="flex items-center">
                              <FaTachometerAlt className="mr-2 text-gray-500" />
                              Dashboard
                            </div>
                          </Link>
                          <button
                            onClick={() => {
                              setIsDropdownOpen(false);
                              logout();
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                          >
                            <div className="flex items-center">
                              <FaSignOutAlt className="mr-2 text-gray-500" />
                              Logout
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/about" className="text-gray-700 hover:text-gray-900 font-medium flex items-center">
                  <FaInfoCircle className="mr-2" />
                  About Us
                </Link>
                <Link href="/login" className="text-gray-700 hover:text-gray-900 font-medium flex items-center">
                  <FaCommentAlt className="mr-2" />
                  Login
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <FaTimes className="block h-6 w-6" />
              ) : (
                <FaBars className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-2 border-t border-gray-200">
            {user ? (
              <div className="pt-2 pb-3 space-y-1">
                {/* User info */}
                <div className="px-4 py-2 flex items-center">
                  <FaUserCircle className="h-8 w-8 text-gray-500 mr-3" />
                  <div>
                    <p className="text-base font-medium text-gray-800">{user.username}</p>
                    <p className="text-sm text-gray-500">{user.role}</p>
                  </div>
                </div>

                {/* WhatsApp Contact Button - In mobile menu for all users */}
                <a
                  href="https://wa.me/919053603098"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-2 text-base font-medium"
                >
                  <div className="flex items-center">
                    <FaWhatsapp className="mr-3 text-xl" />
                    Contact Us
                  </div>
                </a>

                {/* About Us Link for all logged in users */}
                <Link
                  href="/about"
                  className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    <FaInfoCircle className="mr-3 text-gray-500" />
                    About Us
                  </div>
                </Link>

                {user.role === 'admin' ? (
                  // Admin links
                  <Link
                    href="/admin"
                    className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <FaTachometerAlt className="mr-3 text-gray-500" />
                      Admin Dashboard
                    </div>
                  </Link>
                ) : user.role === 'agent' ? (
                  // Agent links
                  <Link
                    href="/agent"
                    className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <FaTachometerAlt className="mr-3 text-gray-500" />
                      Agent Dashboard
                    </div>
                  </Link>
                ) : user.role === 'employee' ? (
                  // Employee links
                  <Link
                    href="/employee"
                    className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <FaTachometerAlt className="mr-3 text-gray-500" />
                      Employee Dashboard
                    </div>
                  </Link>
                ) : (
                  // Regular user links
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <FaTachometerAlt className="mr-3 text-gray-500" />
                      Dashboard
                    </div>
                  </Link>
                )}

                {/* Logout button for all users */}
                <button
                  onClick={logout}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  <div className="flex items-center">
                    <FaSignOutAlt className="mr-3 text-gray-500" />
                    Logout
                  </div>
                </button>
              </div>
            ) : (
              <div className="pt-2 pb-3 space-y-1">
                {/* WhatsApp Contact Button - In mobile menu for non-logged in users too */}
                <a
                  href="https://wa.me/919053603098"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-2 text-base font-medium text-green-600 hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    <FaWhatsapp className="mr-3 text-xl" />
                    Contact Us
                  </div>
                </a>

                <Link
                  href="/about"
                  className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    <FaInfoCircle className="mr-3" />
                    About Us
                  </div>
                </Link>

                <Link
                  href="/login"
                  className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    <FaCommentAlt className="mr-3" />
                    Login
                  </div>
                </Link>

              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
