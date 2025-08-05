// src/components/Auth/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { elasticsearchClient, type Employee } from '../../services/elasticsearch_client';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('🔍 Validating email with Elasticsearch:', email.trim());
      
      // Validate email directly against Elasticsearch
      const employee = await elasticsearchClient.validateUserEmail(email.trim());
      
      if (!employee) {
        throw new Error('Employee not found in directory');
      }

      console.log('✅ Employee found:', employee);

      // Convert employee data to user format for the application
      const user = {
        id: employee.id || email.split('@')[0],
        name: employee.name,
        email: employee.email,
        department: employee.department,
        position: employee.title, // title maps to position
        role: 'employee',
        company: 'Enterprise'
      };

      // Create a simple token for authentication
      const authData = {
        access_token: `es-token-${user.id}-${Date.now()}`,
        user: user
      };
      
      // Store authentication data
      localStorage.setItem('access_token', authData.access_token);
      localStorage.setItem('user', JSON.stringify(authData.user));
      localStorage.setItem('employee_data', JSON.stringify(employee));
      
      // Clear logout flag on successful login
      localStorage.removeItem('logout_requested');
      
      console.log('✅ Login successful:', authData);
      
      // Redirect to main app (which will show documents)
      navigate('/');
    } catch (error) {
      console.error('❌ Login failed:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('CORS') || error.message.includes('fetch')) {
          setError('Cannot connect to Elasticsearch. Please check CORS configuration.');
        } else {
          setError(error.message);
        }
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8">
        <div>
          <div className="mx-auto h-16 w-auto flex justify-center mb-4">
            <img
              className="h-16 w-auto object-contain"
              src="/dbs-logo-1968.jpg"
              alt="DBS Bank"
              onError={(e) => {
                const target = e.currentTarget;
                target.src = '/dbs-logo.svg';
                target.onerror = () => {
                  target.src = '/dbs-logo-official.png';
                  target.onerror = () => {
                    target.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.className = 'h-16 px-6 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl';
                    fallback.textContent = 'DBS Bank';
                    target.parentNode?.appendChild(fallback);
                  };
                };
              }}
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Enterprise Search
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email to access documents
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              placeholder="your.email@company.com"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
              <div className="text-sm text-red-700">
                {error}
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading || !email.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Checking...
                </div>
              ) : (
                'Access Documents'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Enter your company email to validate employee access
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
