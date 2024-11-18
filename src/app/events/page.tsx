// app/events/page.tsx
import React from 'react'
import UpcomingEvents from '../components/UpcomingEvents'

const EventsPage = () => {
  const customTitle = (
    <>
      <h1 className="text-[48px] font-gotham font-bold mb-0 text-slate-900 text-center">
        UPCOMING EVENTS
      </h1>
      <h2 className="text-[24px] font-gotham font-bold mb-4 text-slate-700 text-center">
        Presented by American Defense Alliance
      </h2>
    </>
  );

  const customSubtitle = (
    <p className="text-center text-slate-600 text-xl mb-12 max-w-3xl">
      Join us for industry-leading conferences and networking opportunities. 
      Discover the latest in defense technology and procurement strategies.
    </p>
  );

  return (
    <div className="flex flex-col max-content mt-12">
      <UpcomingEvents
        showMainTitle={false}
        customTitle={customTitle}
        customSubtitle={customSubtitle}
        hideBottomText={false}
      />
    </div>
  );
};

export default EventsPage;