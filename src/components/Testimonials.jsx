import React, { useState } from 'react';

// Sample testimonial data
const testimonialData = [
  {
    id: 1,
    name: 'Rahul Sharma',
    location: 'Delhi, India',
    image: '/images/testimonial/2.jpg',
    rating: 5,
    text: 'Immiza made my visa application process incredibly smooth. I got my Singapore visa in just 4 days! Their customer support was responsive and helpful throughout the process.',
    destination: 'Singapore',
    visaType: 'Tourist'
  },
  {
    id: 2,
    name: 'Priya Patel',
    location: 'Mumbai, India',
    image: '/images/testimonial/1.jpg',
    rating: 5,
    text: 'I was worried about applying for a Dubai visa, but Immiza made it so easy. The document upload system was straightforward, and I received my visa right on time for my business trip.',
    destination: 'United Arab Emirates',
    visaType: 'Work'
  },
  {
    id: 3,
    name: 'Amit Kumar',
    location: 'Bangalore, India',
    image: '/images/testimonial/4.jpg',
    rating: 4,
    text: 'The visa application process for Australia was much simpler than I expected. Immiza guided me through each step and their document verification was quick. Highly recommend!',
    destination: 'Australia',
    visaType: 'Student'
  },
  {
    id: 4,
    name: 'Sneha Reddy',
    location: 'Hyderabad, India',
    image: '/images/testimonial/3.jpg',
    rating: 5,
    text: 'I applied for a Thailand visa through Immiza and got it in just 2 days! The process was transparent, and I could track my application status in real-time. Will definitely use their service again.',
    destination: 'Thailand',
    visaType: 'Tourist'
  },
  {
    id: 5,
    name: 'Vikram Singh',
    location: 'Chandigarh, India',
    image: '/images/testimonial/5.jpg',
    rating: 5,
    text: 'Immiza helped me get my Schengen visa for my Europe trip. Their team was professional and kept me updated throughout the process. The visa was approved without any hassle.',
    destination: 'France',
    visaType: 'Tourist'
  }
];

const TestimonialCard = ({ testimonial }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col h-full">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
          <img
            src={testimonial.image}
            alt={testimonial.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/48?text=User";
            }}
          />
        </div>
        <div>
          <h3 className="font-semibold text-lg">{testimonial.name}</h3>
          <p className="text-gray-600 text-sm">{testimonial.location}</p>
        </div>
      </div>

      <div className="flex items-center mb-3">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 ${i < testimonial.rating ? 'text-[#FFDF00]' : 'text-gray-300'}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>

      <div className="mb-4 flex-grow">
        <p className="text-gray-700 italic">"{testimonial.text}"</p>
      </div>

      <div className="mt-auto">
        <div className="flex items-center justify-between">
          <span className="bg-[#fdf0f2] text-blue-500 text-xs font-medium px-2.5 py-0.5 rounded">
            {testimonial.destination}
          </span>
          <span className="bg-[#fdf0f2] text-green-500 text-xs font-medium px-2.5 py-0.5 rounded">
            {testimonial.visaType} Visa
          </span>
        </div>
      </div>
    </div>
  );
};

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const testimonialsPerPage = 3;
  const totalPages = Math.ceil(testimonialData.length / testimonialsPerPage);

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? totalPages - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === totalPages - 1 ? 0 : prevIndex + 1
    );
  };

  // Get current testimonials to display
  const getCurrentTestimonials = () => {
    const startIndex = (currentIndex * testimonialsPerPage) % testimonialData.length;
    const endIndex = Math.min(startIndex + testimonialsPerPage, testimonialData.length);

    if (endIndex < startIndex + testimonialsPerPage) {
      // Wrap around to the beginning
      return [
        ...testimonialData.slice(startIndex),
        ...testimonialData.slice(0, testimonialsPerPage - (testimonialData.length - startIndex))
      ];
    }

    return testimonialData.slice(startIndex, endIndex);
  };

  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-1 rounded-full text-sm bg-[#fdf0f2] text-[#b76e79] mb-4">
            <span className="mr-2">⭐</span>
            <span>Customer Testimonials</span>
          </div>
          <h2 className="text-3xl font-bold mb-2 text-[#4a3e42]">What Our Customers Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hear from travelers who have successfully obtained their visas through our platform
          </p>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {getCurrentTestimonials().map(testimonial => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center mt-8">
            <button
              onClick={handlePrevious}
              className="mx-2 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
              aria-label="Previous testimonials"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex items-center">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`mx-1 w-2.5 h-2.5 rounded-full ${
                    currentIndex === i ? 'bg-[#b76e79]' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to testimonial page ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="mx-2 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
              aria-label="Next testimonials"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
