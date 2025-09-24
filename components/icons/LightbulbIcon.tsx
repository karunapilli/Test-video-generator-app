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
      d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-11.25a6.01 6.01 0 00-1.5-11.25M12 18v-5.25m0 0h.01M12 18v-5.25m0 0a6.01 6.01 0 011.5-11.25a6.01 6.01 0 01-1.5-11.25m0 0h.01"
    />
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M9.879 17.121a3 3 0 102.242 0M7.5 21h9M12 21v-2.25"
    />
  </svg>
);
