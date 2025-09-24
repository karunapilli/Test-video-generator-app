import React from 'react';

export const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center py-8">
    <div className="w-12 h-12 border-4 border-t-purple-500 border-r-purple-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
    <p className="ml-4 text-lg text-gray-300">Brainstorming viral concepts...</p>
  </div>
);