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
import ListsPage from './components/ListsPage';

const HomePage = () => {
  return (
    <div className="bg-slate-50">
      <HeroSection />
      <UpcomingEvents />
      <MissionStatement />
      <FocusAreas />
      <MailingListSubscription/>
      {/* <Testimonials /> */}
      {/* <LatestNews /> */}
      <FAQSection />
      <ContactUs />
      {/* <ListsPage/> this is for showing iContact list IDs lol */}
    </div>
  );
};

export default HomePage;
