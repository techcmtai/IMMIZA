import React from 'react';
import Link from 'next/link';

const LoadingState = () => {
  return (
    <div className="container mx-auto px-4 py-8 pt-20 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Loading destination details...</h1>
        <p className="mb-4">If this page does not load, the destination may not exist.</p>
        <Link href="/" className="text-blue-600 hover:underline">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default LoadingState;
