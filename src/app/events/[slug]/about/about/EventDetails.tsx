import React from 'react';
import Button from '@/app/components/Button';

type EventProps = {
  title: string;
  eventText: React.ReactNode;
  topicalCoverage: string[];
  registerLink: string;
};

const EventDetails: React.FC<EventProps> = ({ title, eventText, topicalCoverage, registerLink }) => {
  return (
    <div className="min-h-screen text-navy-800 text-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 mb-12 shadow-xl">
          <h2 className="text-3xl font-semibold mb-4 text-navy-500">About the Event</h2>
          <div className="text-lg leading-relaxed">{eventText}</div>
        </div>

        <div className="w-full">
          <h2 className="text-3xl font-semibold mb-6 text-navy-500">Topical Coverage</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {topicalCoverage.map((topic, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 flex-grow-0 flex-shrink-0 basis-full sm:basis-[calc(50%-12px)] lg:basis-[calc(33.333%-16px)]"
              >
                <p className="text-lg font-semibold">{topic}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center w-fit">
          <p className="text-2xl text-navy-500 mb-6 w-fit text-center">Don't miss this groundbreaking event!</p>
          <Button
            title="REGISTER"
            variant="btn_blue"
            link={registerLink}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default EventDetails;