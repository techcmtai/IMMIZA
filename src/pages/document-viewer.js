import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaArrowLeft, FaDownload } from 'react-icons/fa';

export default function DocumentViewer() {
  const router = useRouter();
  const { url, type } = router.query;
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Reset state when URL changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
    setIsLoading(true);
  }, [url]);

  if (!url) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">No Document URL Provided</h1>
          <p className="text-gray-600 mb-6">Please provide a document URL to view.</p>
          <Link
            href="/admin/applications"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <FaArrowLeft className="mr-2" /> Back to Applications
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link
              href="/admin/applications"
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <FaArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">{type || 'Document'} Viewer</h1>
          </div>
          {url && url.startsWith('http') && (
            <a
              href={url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FaDownload className="mr-2" /> Download
            </a>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl w-full">
          {url && url.startsWith('http') ? (
            <div className="relative">
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
              {imageError ? (
                <div className="p-8 text-center">
                  <div className="text-red-500 text-5xl mb-4">⚠️</div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">Failed to load document</h2>
                  <p className="text-gray-600 mb-4">The document could not be loaded. It may have been deleted or moved.</p>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Try opening directly
                  </a>
                </div>
              ) : (
                <div className="relative w-full h-[600px]">
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mb-4"></div>
                        <p className="text-rose-500">Loading document...</p>
                      </div>
                    </div>
                  )}
                  <div className="relative w-full h-full" style={{ display: imageLoaded ? 'block' : 'none' }}>
                    <Image
                      src={url}
                      alt={type || 'Document'}
                      fill
                      style={{ objectFit: 'contain' }}
                      onLoad={() => {
                        setImageLoaded(true);
                        setIsLoading(false);
                      }}
                      onError={() => {
                        setImageError(true);
                        setIsLoading(false);
                      }}
                      unoptimized={true} // For external URLs
                      loading="eager" // Load immediately instead of lazy loading
                      priority={true} // Give this image high priority
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="text-yellow-500 text-5xl mb-4">📄</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Document not available</h2>
              <p className="text-gray-600">This document is not available for preview.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
