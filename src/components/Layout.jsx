import React from 'react';
import dynamic from 'next/dynamic';
import Footer from './Footer';

// Import Navbar with SSR disabled to prevent hydration issues
const Navbar = dynamic(() => import('./Navbar'), { ssr: false });

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
