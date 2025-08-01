// src/App.tsx
import React from 'react';
import { SearchProvider } from './contexts/SearchContext';
import { BrandingProvider } from './contexts/BrandingContext';
import ApiModeWrapper from './components/ApiModeWrapper';
import Layout from './components/Layout/Layout';
import './globals.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <BrandingProvider>
        <ApiModeWrapper>
          <SearchProvider>
            <Layout />
          </SearchProvider>
        </ApiModeWrapper>
      </BrandingProvider>
    </div>
  );
};

export default App;
