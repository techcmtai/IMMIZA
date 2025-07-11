import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';

// No static data - all countries will be fetched from Firebase


const DestinationCard = ({ destination }) => {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/destination/${destination.id}`);
  };

  return (
    <div
      className="bg-white rounded-lg overflow-hidden shadow-md cursor-pointer transform transition-transform hover:scale-105"
      onClick={handleCardClick}
    >
      <div className="relative">
        <Image
          src={destination.image}
          alt={destination.name}
          width={400}
          height={192}
          className="w-full h-48 object-cover"
          placeholder="blur"
          blurDataURL="https://via.placeholder.com/10x10?text=."
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/300x200?text=Image+Not+Found";
          }}
        />
        <div className="absolute top-2 right-2 bg-[#f7e8ea] text-[#834d55] text-xs font-semibold px-2 py-1 rounded-full">
          {destination.issuedRecently} issued recently
        </div>
      </div>

      <div className="p-4 ">
        <h3 className="text-lg font-semibold mb-1">{destination.name}</h3>



        <div className=" items-end">

          <div className="flex flex-col items-end">
            <div className="text-sm">Get Visa in</div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="font-medium">{destination.processingTime}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HomeCard = () => {
  const [visibleCount, setVisibleCount] = useState(8);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  const filterOptions = [
    { id: 'all', label: 'All' },
    { id: 'popular', label: 'Popular' },
    { id: 'week', label: 'Visa in a week' },
    { id: 'easy', label: 'Easy Visas' },
    { id: 'schengen', label: 'Schengen Visa' },
    { id: 'free', label: 'Visa Free' }
  ];

  // Fetch destinations from Firebase
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setLoading(true);

        // First try to get countries from Firebase
        const countriesCollection = collection(db, 'countries');
        const countriesSnapshot = await getDocs(countriesCollection);

        if (!countriesSnapshot.empty) {
          const countriesList = countriesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setDestinations(countriesList);
        } else {
          // If countries collection is empty, try destinations collection as fallback
          const destinationsCollection = collection(db, 'destinations');
          const destinationSnapshot = await getDocs(destinationsCollection);

          if (!destinationSnapshot.empty) {
            const destinationList = destinationSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setDestinations(destinationList);
          } else {
            // No data found in Firebase
            console.log('No countries or destinations in Firebase');
            setDestinations([]);
          }
        }
      } catch (error) {
        console.error('Error fetching destinations:', error);
        // Set empty array on error
        setDestinations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  // First filter by category, then by search query
  const filteredByCategory = activeFilter === 'all'
    ? destinations
    : destinations.filter(dest => dest.category?.includes(activeFilter));

  const filteredDestinations = searchQuery
    ? filteredByCategory.filter(dest =>
        dest.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredByCategory;

  const handleLoadMore = () => {
    setVisibleCount(prevCount => Math.min(prevCount + 4, filteredDestinations.length));
  };

  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
    setVisibleCount(8); // Reset to show only 8 cards when filter changes
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setVisibleCount(8); // Reset to show only 8 cards when search changes
  };

  return (
    <div className="container mx-auto px-4 py-8" id="destination">
      <h2 className="text-2xl font-bold mb-6  text-center">Popular Visa Destinations</h2>

      {/* Search Bar */}
      <div className="max-w-md mx-auto mb-6">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Search for a country..."
            className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#b76e79] focus:border-transparent"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <div className="absolute right-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-6 overflow-x-auto pb-2">
        {filterOptions.map(filter => (
          <button
            key={filter.id}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              activeFilter === filter.id
                ? 'bg-[#b76e79] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => handleFilterChange(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Destination Cards Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b76e79]"></div>
        </div>
      ) : filteredDestinations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredDestinations.slice(0, visibleCount).map(destination => (
            <DestinationCard key={destination.id} destination={destination} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No destinations found matching your criteria.</p>
        </div>
      )}

      {/* Load More Button */}
      {visibleCount < filteredDestinations.length && (
        <div className="text-center mt-8">
          <button
            className="bg-[#b76e79] hover:bg-[#854b54] text-white font-medium py-2 px-6 rounded-full transition-colors"
            onClick={handleLoadMore}
          >
            See More Destinations
          </button>
        </div>
      )}
    </div>
  );
};

export default HomeCard;
