// src/TestApp.tsx - Simple test component
import React from 'react';

const TestApp: React.FC = () => {
  console.log('🎯 TEST APP RENDERING - This should be visible in console');
  
  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: 'red', fontSize: '24px', marginBottom: '20px' }}>
        🔧 REACT TEST APP IS WORKING!
      </h1>
      <div style={{ backgroundColor: 'yellow', padding: '10px', marginBottom: '20px' }}>
        <strong>If you can see this, React is rendering correctly!</strong>
      </div>
      <div style={{ backgroundColor: 'lightblue', padding: '10px', marginBottom: '20px' }}>
        <p>Current time: {new Date().toLocaleString()}</p>
        <p>Local storage token: {localStorage.getItem('access_token') ? 'EXISTS' : 'NOT FOUND'}</p>
        <p>Local storage user: {localStorage.getItem('user') ? 'EXISTS' : 'NOT FOUND'}</p>
      </div>
      <button 
        onClick={() => {
          console.log('Button clicked!');
          alert('React is working!');
        }}
        style={{
          backgroundColor: 'green',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Click to Test React Interactions
      </button>
    </div>
  );
};

export default TestApp;
