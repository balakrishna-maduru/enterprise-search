// src/components/Layout/Footer.tsx
import React from 'react';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = "" }) => {
  return (
    <footer className={`mt-auto ${className}`}>
      <div className="h-px bg-gray-200"></div>
    </footer>
  );
};