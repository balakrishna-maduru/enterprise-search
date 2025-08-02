// src/components/Auth/UserProfile.tsx
import React from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  position: string;
  department: string;
  role: string;
  company: string;
}

interface UserProfileProps {
  user?: User;
  className?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, className = "" }) => {
  // Get user from localStorage if not provided
  const currentUser = user || JSON.parse(localStorage.getItem('user') || 'null');

  if (!currentUser) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex items-center space-x-4 mb-4">
        <div className="h-16 w-16 bg-indigo-500 rounded-full flex items-center justify-center">
          <span className="text-xl font-bold text-white">
            {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
          </span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{currentUser.name}</h3>
          <p className="text-sm text-gray-500">{currentUser.position}</p>
          <p className="text-sm text-gray-400">{currentUser.email}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Department</label>
          <p className="text-gray-900">{currentUser.department || 'Not specified'}</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <p className="text-gray-900 capitalize">{currentUser.role || 'Employee'}</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Company</label>
          <p className="text-gray-900">{currentUser.company || 'Enterprise'}</p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
