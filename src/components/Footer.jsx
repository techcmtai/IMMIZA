import React from 'react';
import Link from 'next/link';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaClock, FaEnvelope, FaPhone } from 'react-icons/fa';
import { BsChatFill } from 'react-icons/bs';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h2 className="text-2xl font-bold text-[#b76e79] mb-4 flex items-center space-x-2">
              <img src="/images/logo.png" alt="IMMIZA Logo" className="h-8 w-8" />
              <span>IMMIZA</span>
            </h2>
            <p className="mb-4 text-sm">
              Your trusted partner for visa and immigration services. We make the complex visa process simple and stress free.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/share/1AqjN1jNxx/?mibextid=wwXIfr" className="text-gray-400 hover:text-white transition-colors">
                <FaFacebookF />
              </a>
              <a href="https://www.instagram.com/immizaportal?igsh=MmF0aXpsNWJ0d3l3" className="text-gray-400 hover:text-white transition-colors">
                <FaInstagram />
              </a>
              <a href="https://www.linkedin.com/in/immiza-portal-85308836a/" className="text-gray-400 hover:text-white transition-colors">
                <FaLinkedinIn />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>

              <li>
                <Link href="#destination" className="text-gray-400 hover:text-white transition-colors">
                  Destinations
                </Link>
              </li>

            </ul>
          </div>

          {/* Our Offices */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Our Office</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400">
                  Sco-11-12, Sarojai Tower, Ground Floor, New Bus Stand, Kurukshetra, Haryana, 136118
                </p>
              </div>
            </div>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <FaPhone className="text-[#b76e79] mr-2" />
                <a href="tel:+919053603098" className="text-gray-400 hover:text-white transition-colors">
                  +91 9053603098
                </a>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="text-[#b76e79] mr-2" />
                <a href="mailto:support@immiza.com" className="text-gray-400 hover:text-white transition-colors">
                  support@immiza.com
                </a>
              </li>
              <li className="flex items-center">
                <FaClock className="text-[#b76e79] mr-2" />
                <span className="text-gray-400">Mon - Fri: 9:00 AM - 6:00 PM</span>
              </li>
              <li>
                <a
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-[#b76e79] text-white px-4 py-2 rounded-md hover:bg-[#9a5a64] transition-colors"
                >
                  <BsChatFill className="mr-2" />
                  Chat with us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500 mb-4 md:mb-0">
            © {new Date().getFullYear()} IMMIZA. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link href="/privacy" className="text-sm text-gray-500 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/term" className="text-sm text-gray-500 hover:text-white transition-colors">
              Terms of Service
            </Link>

          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
