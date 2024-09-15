<<<<<<< Updated upstream
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
=======
import React from 'react';
import HeroSection from './components/HeroSection';
import MissionStatement from './components/MissionStatement';
import UpcomingEvents from './components/UpcomingEvents';
import FocusAreas from './components/FocusAreas';
import Testimonials from './components/Testimonials';
import LatestNews from './components/LatestNews';
import FAQSection from './components/FAQSection';
import ContactUs from './components/ContactUs';

const HomePage = () => {
  return (
    <div className="bg-slate-50">
      <HeroSection />
      <MissionStatement />
      <UpcomingEvents />
      <FocusAreas />
      {/* <Testimonials /> */}
      {/* <LatestNews /> */}
      <FAQSection />
      <ContactUs />
>>>>>>> Stashed changes
    </div>
  );
};

<<<<<<< Updated upstream
export default ConstructionPage;
=======
export default HomePage;
>>>>>>> Stashed changes
