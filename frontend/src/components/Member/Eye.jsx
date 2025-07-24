import React from 'react';

const Eye = ({ size = 24, color = 'currentColor', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <path d="M2.0678 12C3.76014 7.60833 8.35158 4 12 4C15.6484 4 20.2399 7.60833 21.9322 12C20.2399 16.3917 15.6484 20 12 20C8.35158 20 3.76014 16.3917 2.0678 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export default Eye;
