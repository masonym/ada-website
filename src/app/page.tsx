import React from 'react';
import HeroSection from './components/HeroSection';
import MissionStatement from './components/MissionStatement';
import UpcomingEvents from './components/UpcomingEvents';
import FocusAreas from './components/FocusAreas';
import Testimonials from './components/Testimonials';
import LatestNews from './components/LatestNews';
import FAQSection from './components/FAQSection';
import ContactUs from './components/ContactUs';
import MailingListSubscription from './components/MailingListSubscription';

const HomePage = () => {
  return (
    <div className="bg-slate-50">
      <HeroSection />
      <MissionStatement />
      <UpcomingEvents />
      <FocusAreas />
      <MailingListSubscription/>
      {/* <Testimonials /> */}
      {/* <LatestNews /> */}
      <FAQSection />
      <ContactUs />
    </div>
  );
};

export default HomePage;
