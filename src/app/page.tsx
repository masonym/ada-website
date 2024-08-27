import { FC } from 'react';

const ConstructionPage: FC = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f0f0',
    }}>
      <div style={{
        textAlign: 'center',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
      }}>
        <h1 style={{ color: '#333' }}>Site Under Construction</h1>
        <p style={{ color: '#666' }}>Please check back soon!</p>
      </div>
    </div>
  );
};

export default ConstructionPage;