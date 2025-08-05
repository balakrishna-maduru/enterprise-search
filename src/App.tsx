// src/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SearchProvider } from './contexts/SearchContext';
import { BrandingProvider } from './contexts/BrandingContext';
import { LoginPage, ProtectedRoute } from './components/Auth';
import ApiModeWrapper from './components/ApiModeWrapper';
import { Layout } from './components/Layout';
import { documentTracker } from './services/document_tracking_service';
import './globals.css';

const App: React.FC = () => {
  console.log('🎯 APP COMPONENT RENDERING...');

  useEffect(() => {
    // Initialize document tracking index when app starts
    const initializeTracking = async () => {
      try {
        await documentTracker.initializeIndex();
        console.log('📊 Document tracking initialized');
      } catch (error) {
        console.error('Failed to initialize document tracking:', error);
      }
    };

    initializeTracking();
  }, []);
  
  return (
    <Router>
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
      </Router>
    );
  };

  export default App;
