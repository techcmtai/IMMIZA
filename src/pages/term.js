import React from 'react';

const Terms = () => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 text-gray-800">
      <h1 className="text-4xl font-bold mb-8 text-center text-[#9a5a64]">Terms & Conditions</h1>
      <p className="mb-6">Welcome to <strong>IMMIZA PORTAL</strong>. By accessing or using our services, you agree to the following Terms and Conditions:</p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">1. Definitions</h2>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Portal</strong> refers to IMMIZA PORTAL, the online platform.</li>
          <li><strong>Users</strong> refers to students using the platform to apply to institutions.</li>
          <li><strong>Agents</strong> refers to verified third-party representatives who assist with applications.</li>
          <li><strong>Institutions</strong> refers to international universities/colleges listed on our portal.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">2. Student Responsibilities</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Provide accurate and complete personal and academic information.</li>
          <li>Ensure all documents are valid and truthful.</li>
          <li>Pay all necessary fees as listed on the portal.</li>
          <li>Acknowledge that admission decisions are made by institutions, not the portal.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">3. Agent Responsibilities</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Must be approved by IMMIZA PORTAL to operate on the platform.</li>
          <li>Must not misrepresent institutions, visa processes, or fees.</li>
          <li>Shall handle student information confidentially and comply with applicable data laws.</li>
          <li>Are subject to periodic review and may be suspended for misconduct.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">4. Portal Responsibilities</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Maintain a secure and transparent platform for application processing.</li>
          <li>Provide timely updates on application statuses.</li>
          <li>Vet agents and institutions listed on the portal.</li>
          <li>Offer customer support and dispute resolution mechanisms.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">5. Fees and Payments</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Platform service fees are listed clearly for students and agents.</li>
          <li>No guarantees of admission or visa are implied by payments made on the portal.</li>
          <li><strong>Payment is non-refundable.</strong></li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">6. Data Protection and Privacy</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>The portal collects and stores personal data per the Privacy Policy.</li>
          <li>Data is only shared with institutions and agents as authorized by the user.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">7. Limitation of Liability</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>The portal is not liable for:</li>
          <ul className="list-disc list-inside ml-5 space-y-1">
            <li>Admission rejections.</li>
            <li>Visa denials.</li>
            <li>Misconduct by independent agents or institutions.</li>
          </ul>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">8. Termination</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Users and agents may be removed for violations of these terms.</li>
          <li>The portal may discontinue services at any time with prior notice.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">9. Governing Law</h2>
        <p>These terms are governed by the laws of court.</p>
      </section>
    </div>
  );
};

export default Terms;
