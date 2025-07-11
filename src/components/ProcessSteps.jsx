import React, { useEffect, useRef } from 'react';

const ProcessSteps = () => {
  const sectionRef = useRef(null);

  // Process steps data
  const steps = [
    {
      id: '1',
      title: 'Choose a Country',
      description: 'Select your destination country from our comprehensive list of supported countries.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#b76e79]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: '2',
      title: 'Select Your Purpose',
      description: 'Choose the purpose of your travel - tourism, work, or study to get tailored requirements.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#b76e79]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    {
      id: '3',
      title: 'Get Your Checklist',
      description: 'Receive a personalized checklist of all documents required for your visa application.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#b76e79]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      )
    },
    {
      id: '4',
      title: 'Track Your Progress',
      description: 'Monitor your visa application status in real-time through our intuitive dashboard.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#b76e79]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ];

  // Animation for the steps on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    const stepElements = document.querySelectorAll('.process-step');
    stepElements.forEach((el) => observer.observe(el));

    return () => {
      stepElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <section id="how-it-works" ref={sectionRef} className="py-20 bg-gradient-to-b from-white to-[#fdf0f2]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-1 rounded-full text-sm bg-[#fdf0f2] text-[#b76e79] mb-4">
            <span className="mr-2">✨</span>
            <span>Easy 4-Step Process</span>
          </div>
          <h2 className="text-4xl font-bold mb-3 text-[#4a3e42]">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Get your visa with our simple step-by-step process
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Process Steps */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="process-step opacity-0 transition-all duration-700 delay-300 transform translate-y-8 bg-white p-6 rounded-xl shadow-lg flex flex-col items-center text-center relative z-10 border border-gray-100 hover:shadow-xl hover:-translate-y-1"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-[#014421] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-md">
                  {step.id}
                </div>
                <div className="mb-4 bg-[#fdf0f2] p-3 rounded-full">{step.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-[#4a3e42]">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>

          {/* Connecting Lines */}
          <div className="hidden md:block">
            {/* Continuous line across all steps */}
            <div className="absolute top-1/3 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-[#b76e79] via-[#b76e79] to-[#b76e79] rounded z-0"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSteps;
