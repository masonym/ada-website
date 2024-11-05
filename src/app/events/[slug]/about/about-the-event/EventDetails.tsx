import React from 'react';
import Button from '@/app/components/Button';

type TopicalCoverage = {
  tagline: string;
  description: string;
};

type EventProps = {
  title: string;
  eventText: React.ReactNode;
  topicalCoverage: TopicalCoverage[];
  registerLink: string;
};

const EventDetails: React.FC<EventProps> = ({ title, eventText, topicalCoverage, registerLink }) => {
  return (
    <div className="min-h-screen text-navy-800 text-center">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-12 shadow-xl">
          {/* <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center font-gotham text-slate-700 mt-6 mb-2">
            About the Event
          </h2> */}
          <div className="text-lg leading-relaxed">{eventText}</div>
        </div>

        <div className="w-full">
          <h2 className="text-3xl font-semibold mb-6 text-navy-500">Key Insights</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {topicalCoverage.map((topic, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 flex-grow-0 flex-shrink-0 basis-full sm:basis-[calc(50%-12px)] lg:basis-[calc(33.333%-16px)]"
              >
                <h3 className="text-lg font-bold mb-2 text-center text-navy-800">
                  {topic.tagline}
                </h3>
                <p className="text-base place-self-center text-gray-700">{topic.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center flex flex-col items-center">
          <p className="text-2xl text-navy-500 mb-6 text-center mx-8">Act Now and Secure your Seat at this Groundbreaking Event!</p>
          <Button
            title="REGISTER"
            variant="btn_blue"
            link={registerLink}
            className="max-w-xs sm:max-w-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default EventDetails;