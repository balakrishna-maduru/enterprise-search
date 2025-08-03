// src/components/Auth/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Employee {
  id: string;
  name: string;
  email: string;
  title: string;
  department: string;
  location?: string;
  level?: number;
  phone?: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState<Employee | null>(null);
  const [demoUsers, setDemoUsers] = useState<Employee[]>([]);

  // Set up demo users on component mount
  useEffect(() => {
    const defaultUsers = [
      {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@company.com',
        title: 'Senior Manager',
        department: 'Engineering',
        location: 'New York',
        level: 3
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@company.com',
        title: 'Product Manager',
        department: 'Product',
        location: 'San Francisco',
        level: 3
      },
      {
        id: '3',
        name: 'Mike Chen',
        email: 'mike.chen@company.com',
        title: 'Software Engineer',
        department: 'Engineering',
        location: 'Seattle',
        level: 2
      },
      {
        id: '23',
        name: 'Anna Parker',
        email: 'anna.parker@company.com',
        title: 'Software Engineer',
        department: 'Technology',
        location: 'San Francisco',
        level: 4
      }
    ];
    setDemoUsers(defaultUsers);
  }, []);

  const handleLogin = async () => {
    if (!selectedUser) return;

    try {
      // Clear logout flag on successful login
      localStorage.removeItem('logout_requested');
      
      // Store user data in localStorage
      localStorage.setItem('access_token', 'demo-token-' + selectedUser.id);
      localStorage.setItem('user', JSON.stringify(selectedUser));
      
      // Redirect to main app
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f3f4f6' fill-opacity='0.4'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
    }}>
      <div className="max-w-md w-full space-y-8 bg-white shadow-2xl rounded-2xl p-8 border border-gray-100">
        <div>
          <div className="mx-auto h-16 w-auto flex justify-center mb-4">
            <img
              className="h-16 w-auto object-contain drop-shadow-sm"
              src="/dbs-logo-1968.jpg"
              alt="DBS Bank"
              onLoad={() => console.log('DBS logo loaded successfully')}
              onError={(e) => {
                console.log('JPG logo failed, trying SVG');
                const target = e.currentTarget;
                target.src = '/dbs-logo.svg';
                target.onerror = () => {
                  console.log('SVG logo also failed, trying PNG');
                  target.src = '/dbs-logo-official.png';
                  target.onerror = () => {
                    console.log('All logos failed, showing fallback');
                    target.style.display = 'none';
                    // Show fallback text with DBS red branding
                    const fallback = document.createElement('div');
                    fallback.className = 'h-16 px-6 bg-gradient-to-r from-red-600 to-red-700 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg';
                    fallback.textContent = 'DBS Bank';
                    target.parentNode?.appendChild(fallback);
                  };
                };
              }}
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Enterprise Search
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Select a demo user to continue
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Demo Users
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {demoUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`p-3 rounded-md border cursor-pointer transition-colors shadow-sm ${
                      selectedUser?.id === user.id
                        ? 'border-red-500 bg-red-50 shadow-md'
                        : 'border-gray-300 hover:border-red-300 hover:bg-gray-50 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.title}</div>
                        <div className="text-xs text-gray-400">{user.department}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-400">{user.location}</div>
                        <div className="text-xs text-gray-500">Level {user.level}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleLogin}
              disabled={!selectedUser}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white shadow-lg transition-all duration-200 ${
                selectedUser
                  ? 'bg-red-600 hover:bg-red-700 hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {selectedUser ? `Sign in as ${selectedUser.name}` : 'Select a user to continue'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              🔧 Development Mode - Select any demo user to access the application
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
