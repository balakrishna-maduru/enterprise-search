// src/components/Common/SourceIcon.js
import React from 'react';
import { FileText, Users, Share2 } from 'lucide-react';

const SourceIcon = ({ source, size = 4 }) => {
  const sizeClass = `w-${size} h-${size}`;
  
  switch (source?.toLowerCase()) {
    case 'jira':
      return <FileText className={`${sizeClass} text-blue-600`} />;
    case 'confluence':
      return <Users className={`${sizeClass} text-green-600`} />;
    case 'sharepoint':
      return <Share2 className={`${sizeClass} text-purple-600`} />;
    default:
      return <FileText className={`${sizeClass} text-gray-600`} />;
  }
};

export default SourceIcon;