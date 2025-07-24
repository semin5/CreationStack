import React from 'react';

const EyeOff = ({ size = 24, color = 'currentColor', ...props }) => (
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
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-3.65 0-7.23-3.6-8-8 1.4-1.6 2.83-2.85 4.31-3.62M17.83 5.72c.5.9.89 1.94 1.17 3.05M19 12c-.75 2.1-2.09 3.93-3.69 5.25L2 2l20 20-2-2zM4.24 4.24l1.42 1.42" />
    <line x1="1" y1="1" x2="23" y2="23" /> {/* 추가적인 사선 */}
  </svg>
);

export default EyeOff;
