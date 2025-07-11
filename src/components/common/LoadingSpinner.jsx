import React from 'react';

const LoadingSpinner = ({ size = 'medium', color = 'blue' }) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  const colorClasses = {
    blue: 'border-blue-500',
    rose: 'border-rose-500',
    indigo: 'border-indigo-500',
    green: 'border-green-500'
  };

  return (
    <div className="flex justify-center items-center p-8">
      <div className={`animate-spin rounded-full ${sizeClasses[size]} border-t-2 border-b-2 ${colorClasses[color]}`}></div>
    </div>
  );
};

export default LoadingSpinner;
