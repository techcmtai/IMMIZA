import React, { useState } from 'react';
import Link from 'next/link';
import { FaArrowRight, FaWhatsapp, FaRegClock } from 'react-icons/fa';
import { BsGlobe } from 'react-icons/bs';
import { IoMdCheckmarkCircleOutline } from 'react-icons/io';

const HeroSection = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset states
    setSubmitSuccess(false);
    setSubmitError('');

    // Basic validation
    if (!phoneNumber.trim()) {
      setSubmitError('Please enter a valid phone number');
      return;
    }

    try {
      setIsSubmitting(true);

      // Call the API to submit the contact information
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success
        setSubmitSuccess(true);
        setPhoneNumber(''); // Clear the input
      } else {
        // API returned an error
        setSubmitError(data.message || 'Failed to submit. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting contact:', error);
      setSubmitError('Network error. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Column - Hero Text */}
          <div className="space-y-8">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#fdf0f2] text-[#b76e79] mb-4">
              <span className="mr-2">✦</span>
              <span>Trusted by 50k+ visa applicants</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Seamless Visa
              <span className="block text-[#b76e79]">Immigration</span>
              <span className="block">Services</span>
            </h1>

            <p className="text-lg text-gray-700">
              IMMIZA makes visa applications simple with our digital
              platform. Get personalized guidance from our expert
              consultants.
            </p>

            <div className="flex flex-wrap gap-4">
              <a href="#destination"
               className="inline-flex items-center px-6 py-3 bg-[#b76e79] text-white rounded-full hover:bg-[#9a5a64] transition-colors">
                Explore Destinations
                <FaArrowRight className="ml-2" />
              </a>

              <a
                href="#how-it-works"
                className="inline-flex items-center px-6 py-3 border border-[#d4a1a9] text-[#4a3e42] rounded-full hover:bg-[#fdf0f2] transition-colors"
              >
                How It Works
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="flex items-start">
                <BsGlobe className="text-[#b76e79] text-xl mt-1 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Access to visa services for 190+</p>
                  <p className="text-gray-600">countries</p>
                </div>
              </div>

              <div className="flex items-start">
                <IoMdCheckmarkCircleOutline className="text-[#b76e79] text-xl mt-1 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">90% application approval rate</p>
                </div>
              </div>

              <div className="flex items-start">
                <FaRegClock className="text-[#b76e79] text-xl mt-1 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Fast-track processing available</p>
                </div>
              </div>

              <div className="flex items-start">
                <FaRegClock className="text-[#b76e79] text-xl mt-1 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">24/7 application status tracking</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="bg-white rounded-lg shadow-lg p-8 ">
            <div className="flex justify-center mb-6">
              <div className="w-5 h-5 bg-[#fdf0f2] rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#b76e79]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Get Visa Assistance</h2>
            <p className="text-center text-gray-600 mb-6">Our immigration experts are ready to help</p>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  className={`w-full px-4 py-3 border rounded-md focus:ring-[#b76e79] focus:border-[#b76e79] ${
                    submitError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+91 "
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              {submitError && (
                <div className="mb-4 text-red-500 text-sm">
                  {submitError}
                </div>
              )}

              {submitSuccess && (
                <div className="mb-4 text-green-600 text-sm bg-green-50 p-2 rounded">
                  Thank you! Our expert will contact you shortly.
                </div>
              )}

              <button
                type="submit"
                className={`w-full bg-[#b76e79] text-white py-3 px-4 rounded-md hover:bg-[#9a5a64] transition-colors ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Get Expert Consultation'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 mb-4">OR</p>

              <a
                href="https://wa.me/9190536 03098"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full text-green-600 border border-green-600 rounded-md py-3 px-4 hover:bg-green-50 transition-colors"
              >
                <FaWhatsapp className="mr-2 text-xl" />
                Chat on WhatsApp
              </a>
            </div>

            <p className="text-xs text-center text-gray-500 mt-6">
              By submitting, you agree to our{' '}
              <Link href="/terms" className="text-[#b76e79] hover:underline">
                Terms
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-[#b76e79] hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;