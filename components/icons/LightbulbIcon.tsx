import React from 'react';

export const LightbulbIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-11.25H12a6.01 6.01 0 00-1.5 11.25m1.5 0h.01M9 12.75a3 3 0 116 0 3 3 0 01-6 0z" 
    />
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M7.5 21h9M12 21v-2.25" 
    />
  </svg>
);