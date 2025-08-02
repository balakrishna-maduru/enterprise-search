// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SearchProvider } from './contexts/SearchContext';
import { BrandingProvider } from './contexts/BrandingContext';
import { LoginPage, ProtectedRoute } from './components/Auth';
import ApiModeWrapper from './components/ApiModeWrapper';
import { Layout } from './components/Layout';
import './globals.css';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <BrandingProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/*" 
              element={
                <ProtectedRoute>
                  <ApiModeWrapper>
                    <SearchProvider>
                      <Layout />
                    </SearchProvider>
                  </ApiModeWrapper>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </BrandingProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
