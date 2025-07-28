import { useState, useEffect, createContext, useContext } from 'react';
import { config } from '../config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('auth_token'));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('current_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [availableUsers, setAvailableUsers] = useState([]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('auth_token', token);
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('auth_token');
      setIsAuthenticated(false);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('current_user');
    }
  }, [user]);

  const getAuthHeaders = () => {
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await fetch(`${config.api.baseUrl}/auth/users`);
      if (response.ok) {
        const data = await response.json();
        setAvailableUsers(data.users);
        return data.users;
      }
    } catch (error) {
      console.error('Failed to fetch available users:', error);
    }
    return [];
  };

  const login = async (email) => {
    try {
      const response = await fetch(`${config.api.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.access_token);
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        const error = await response.json();
        return { success: false, error: error.detail };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshToken = async () => {
    try {
      const response = await fetch(`${config.api.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.access_token);
        return true;
      } else {
        logout();
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return false;
    }
  };

  const getCurrentUser = async () => {
    try {
      const response = await fetch(`${config.api.baseUrl}/auth/me`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        return userData;
      } else if (response.status === 401) {
        logout();
        return null;
      }
    } catch (error) {
      console.error('Failed to get current user:', error);
    }
    return null;
  };

  const value = {
    token,
    user,
    isAuthenticated,
    availableUsers,
    login,
    logout,
    refreshToken,
    getCurrentUser,
    fetchAvailableUsers,
    getAuthHeaders,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};