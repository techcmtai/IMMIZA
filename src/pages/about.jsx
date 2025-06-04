import React from 'react';
import Image from 'next/image';
import { FaPlane, FaPassport, FaGlobe, FaUsers, FaHandshake, FaHeadset, FaUniversity, FaBriefcase, FaUmbrellaBeach, FaCheck } from 'react-icons/fa';

const AboutUs = () => {
  return (
    <>


      <main >
        {/* Hero Section */}
        <section className="bg-[#b76e79] py-16">
  <div className="container mx-auto px-4 md:px-6">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <p className="text-white uppercase tracking-wider font-medium mb-2">SERVICES OFFERED</p>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Your Gateway to<br />Global Opportunities</h1>
        <p className="text-white text-lg max-w-3xl mx-auto">
          Study Abroad, Study Visa, Work Visa, Tourist Visa - We've Got You Covered!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">

        {/* Study Visa Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start">
            <div className="mr-4 text-[#b76e79]">
              <FaUniversity size={36} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Student Visa</h3>
              <p className="text-gray-600">
                Unlock Your Academic Journey Abroad with Hassle-Free Study Visa Solutions
              </p>
            </div>
          </div>
        </div>

        {/* Work Visa Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start">
            <div className="mr-4 text-[#b76e79]">
              <FaBriefcase size={36} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Work Visa</h3>
              <p className="text-gray-600">
                Realize Your Career Aspirations Abroad with Our Work Visa Expertise
              </p>
            </div>
          </div>
        </div>

        {/* Tourist Visa Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start">
            <div className="mr-4 text-[#b76e79]">
              <FaUmbrellaBeach size={36} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Tourist Visa</h3>
              <p className="text-gray-600">
                Embark on Exciting Journeys Worldwide with Our Hassle-Free Tourist Visa Services
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</section>



        {/* About IMMIZA Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row items-center gap-12">
                {/* Image Side */}
                <div className="w-full md:w-1/2 mb-8 md:mb-0">
                  <div className="relative rounded-lg overflow-hidden shadow-xl">
                    <Image
                      src="/images/c.jpeg"
                      alt="IMMIZA Team"
                      width={600}
                      height={450}
                      className="w-full h-auto object-cover"
                      style={{
                        objectFit: 'cover',
                        height: '450px'
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                      <div className="p-6 text-white">
                        <p className="text-lg font-semibold">Simplifying visa processes since 2023</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Text Side */}
                <div className="w-full md:w-1/2">
                  <h2 className="text-3xl font-bold mb-6 text-gray-800">About <span className="text-[#b76e79]">IMMIZA</span></h2>

                  <div className="space-y-4 text-gray-600">
                    <p className="text-lg">
                      Founded in 2023, IMMIZA was born from a simple vision: to make the visa application process
                      straightforward, transparent, and stress-free for travelers around the world.
                    </p>

                    <p className="text-lg">
                      Our founders experienced firsthand the challenges and complexities of navigating visa applications
                      across different countries. They recognized the need for a service that could guide applicants
                      through the process with clarity and efficiency.
                    </p>

                    <div className="mt-6 space-y-3">
                      <div className="flex items-start">
                        <FaCheck className="text-[#b76e79] mt-1 mr-3 flex-shrink-0" />
                        <p>Streamlined visa application process with expert guidance</p>
                      </div>
                      <div className="flex items-start">
                        <FaCheck className="text-[#b76e79] mt-1 mr-3 flex-shrink-0" />
                        <p>Comprehensive support for study, work, and tourist visas</p>
                      </div>
                      <div className="flex items-start">
                        <FaCheck className="text-[#b76e79] mt-1 mr-3 flex-shrink-0" />
                        <p>Personalized assistance throughout your visa journey</p>
                      </div>
                    </div>

                    <p className="text-lg mt-6">
                      Today, IMMIZA has grown into a trusted platform serving thousands of travelers, students, and
                      professionals seeking to explore new destinations, pursue education, or advance their careers abroad.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Mission Section */}
        <section className="py-8 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-8 text-gray-800">Our Mission</h2>
              <p className="text-xl text-gray-600 mb-10">
                To empower global mobility by providing accessible, reliable, and efficient visa services that connect
                people to opportunities worldwide.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="text-[#b76e79] mb-4 flex justify-center">
                    <FaPassport className="text-4xl" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Simplify</h3>
                  <p className="text-gray-600">
                    We simplify complex visa processes into clear, manageable steps.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="text-[#b76e79] mb-4 flex justify-center">
                    <FaGlobe className="text-4xl" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Connect</h3>
                  <p className="text-gray-600">
                    We connect people to global opportunities through efficient visa solutions.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="text-[#b76e79] mb-4 flex justify-center">
                    <FaHandshake className="text-4xl" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Support</h3>
                  <p className="text-gray-600">
                    We provide personalized support throughout the entire visa journey.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-12 text-center text-gray-800">Why Choose IMMIZA</h2>

              <div className="space-y-8">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="bg-[#b76e79] text-white p-4 rounded-full">
                    <FaUsers className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Expert Guidance</h3>
                    <p className="text-gray-600">
                      Our team of visa specialists brings years of experience and up-to-date knowledge of visa requirements
                      for countries worldwide.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="bg-[#b76e79] text-white p-4 rounded-full">
                    <FaPlane className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Streamlined Process</h3>
                    <p className="text-gray-600">
                      We've simplified the visa application process with our intuitive platform, clear document checklists,
                      and step-by-step guidance.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="bg-[#b76e79] text-white p-4 rounded-full">
                    <FaHeadset className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Dedicated Support</h3>
                    <p className="text-gray-600">
                      Our customer support team is available to assist you at every stage of your visa application journey.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-[#b76e79] text-white">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Start Your Journey?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Let us help you navigate the visa process with ease and confidence.
            </p>
            <a
              href="/"
              className="inline-block bg-white text-[#b76e79] font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Apply Now
            </a>
          </div>
        </section>
      </main>

    </>
  );
};

export default AboutUs;
