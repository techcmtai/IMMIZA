import React from 'react';
import { FaSearch, FaFilter, FaPassport, FaGlobe } from 'react-icons/fa';

const ApplicationFilters = ({ 
  statusFilter, 
  setStatusFilter, 
  visaTypeFilter, 
  setVisaTypeFilter,
  destinationFilter,
  setDestinationFilter,
  searchTerm,
  setSearchTerm,
  statusOptions,
  visaTypes,
  destinations
}) => {
  return (
    <div className="bg-white shadow rounded-lg mb-6 p-4">
      <div className="flex flex-col space-y-4">
        {/* Filter Row */}
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          {/* Status Filter */}
         
          
          {/* Visa Type Filter */}
          <div className="flex items-center space-x-2">
            <FaPassport className="text-gray-400" />
            <select
              value={visaTypeFilter}
              onChange={(e) => setVisaTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {visaTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Visa Types' : `${type} Visa`}
                </option>
              ))}
            </select>
          </div>
          
          {/* Destination Filter */}
          <div className="flex items-center space-x-2">
            <FaGlobe className="text-gray-400" />
            <select
              value={destinationFilter}
              onChange={(e) => setDestinationFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {destinations.map(destination => (
                <option key={destination} value={destination}>
                  {destination === 'all' ? 'All Destinations' : destination}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Search Row */}
        {/* <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, destination, or visa type..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div> */}
      </div>
    </div>
  );
};

export default ApplicationFilters;
