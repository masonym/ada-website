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
import EventHighlights from './components/EventHighlights';

const HomePage = () => {
  return (
    <div className="bg-slate-50">
      <HeroSection />
      <UpcomingEvents />
      <MissionStatement />
      <FocusAreas />
      <Testimonials eventIds={[1, 4]} types={['video', 'image']} showDefaultVideos={false} />
      <EventHighlights
        sourceEventId={4}
        title="2025 Navy & Marine Corps Procurement Conference Highlights"
        subtitle="Watch standout moments from last year's Navy & Marine Corps Procurement Conference"
      />
      <MailingListSubscription />
      {/* <LatestNews /> */}
      <FAQSection />
      <ContactUs />
      {/* <ListsPage/> this is for showing iContact list IDs lol */}
    </div>
  );
};

export default HomePage;
