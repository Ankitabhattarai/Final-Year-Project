import React from 'react';

export default function PageWrapper({ children, className = '' }) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-12 ${className}`}>
      {children}
    </div>
  );
}
