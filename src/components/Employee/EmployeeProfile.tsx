// src/components/Employee/EmployeeProfile.tsx
import React, { useState } from 'react';
import { useUser } from '../../hooks/useUser';
import { SearchResult } from '../../types';

interface EmployeeProfileProps {
  className?: string;
}

const EmployeeProfile: React.FC<EmployeeProfileProps> = ({ className = '' }) => {
  const { user: currentUser } = useUser();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!currentUser) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">Please log in</p>
        </div>
      </div>
    );
  }

  // Convert current user to employee data format if available
  const employeeData = {
    name: currentUser.name || 'User',
    title: currentUser.position || 'Employee',
    email: currentUser.email || '',
    department: currentUser.department || 'Unknown',
    location: 'Not specified',
    phone: '+1 (555) 123-4567',
    level: 1,
    start_date: new Date().toISOString().split('T')[0],
    manager: 'John Smith',
    team: 'Product Development'
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Compact User Header - Always Visible */}
      <div 
        className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 cursor-pointer hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center ring-2 ring-white/30">
                  <span className="text-white font-semibold text-lg">
                    {employeeData.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                {/* Online status indicator */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <h2 className="text-white font-semibold text-base">{employeeData.name}</h2>
                <p className="text-blue-100 text-sm">{employeeData.title}</p>
                <p className="text-blue-200 text-xs">Click to {isExpanded ? 'collapse' : 'expand'}</p>
              </div>
            </div>          {/* Expand/Collapse Icon */}
          <div className="text-white/80 hover:text-white transition-colors">
            <svg 
              className={`w-5 h-5 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Expandable Details Section */}
      <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
        <div className="p-4 space-y-4">
          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Contact Details
            </h3>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-600">{employeeData.email}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-gray-600">{employeeData.phone}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="text-gray-600">{employeeData.department}</span>
              </div>
            </div>
          </div>

          {/* Work Information & Hierarchy */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Organization
            </h3>
            
            {/* Hierarchy Display */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="text-xs font-medium text-gray-500 mb-2">REPORTING STRUCTURE</div>
              <div className="space-y-2">
                {/* Manager */}
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{employeeData.manager}</div>
                    <div className="text-xs text-gray-500">Manager</div>
                  </div>
                </div>
                
                {/* Current User */}
                <div className="flex items-center space-x-2 ml-4 relative">
                  <div className="absolute -left-4 top-3 w-3 h-px bg-gray-300"></div>
                  <div className="absolute -left-4 top-0 w-px h-6 bg-gray-300"></div>
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-blue-900">{employeeData.name}</div>
                    <div className="text-xs text-blue-600">{employeeData.title} (You)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Team & Department Info */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Department</label>
                <p className="text-gray-700 mt-1 font-medium">{employeeData.department}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Team</label>
                <p className="text-gray-700 mt-1 font-medium">{employeeData.team}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Level</label>
                <div className="flex items-center mt-1">
                  <span className="text-gray-700 font-medium">Level {employeeData.level}</span>
                  <div className="ml-2 flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`w-2 h-2 rounded-full ${i < employeeData.level ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tenure</label>
                <p className="text-gray-700 mt-1 font-medium">
                  {Math.floor((Date.now() - new Date(employeeData.start_date).getTime()) / (1000 * 60 * 60 * 24 * 365))} years
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center justify-center px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                My Docs
              </button>
              <button className="flex items-center justify-center px-3 py-2 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Searches
              </button>
              <button className="flex items-center justify-center px-3 py-2 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                Saved
              </button>
              <button className="flex items-center justify-center px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
