import React from 'react';
import Button from '@/app/components/Button';
import ExpectationsSection from './ExpectationsSection';
import { FeaturedTopicDetail } from '@/types/events';

type TopicalCoverage = {
  tagline: string;
  description: string;
};

type ExpectationItem = {
  title: string;
  description: string;
};

type AudienceExpectations = {
  audienceType: string;
  expectations: ExpectationItem[];
};

type EventDetailsProps = {
  title: string;
  eventText: React.ReactNode;
  topicalCoverage: TopicalCoverage[];
  registerLink: string;
  expectations?: AudienceExpectations[];
  expectationsText?: string;
  featuredTopics?: FeaturedTopicDetail[];
  featuredTopicsTitle?: string;
  featuredTopicsSubtitle?: string;
};

const EventDetails: React.FC<EventDetailsProps> = ({ 
  title, 
  eventText, 
  topicalCoverage, 
  registerLink,
  expectations,
  expectationsText,
  featuredTopics,
  featuredTopicsTitle,
  featuredTopicsSubtitle
}) => {
  return (
    <div className="min-h-screen text-navy-800 text-center">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        {/* Event Overview Section */}
        <div className="rounded-xl mb-4">
          <div className="text-lg leading-relaxed">{eventText}</div>
        </div>

        {/* Featured Topics Section */}
        {featuredTopics && featuredTopics.length > 0 && (
          <div className="w-full mb-12">
            <h2 className="text-3xl font-semibold mb-2 text-slate-700">{featuredTopicsTitle}</h2>
            <h3 className="text-xl mb-4 text-slate-700">{featuredTopicsSubtitle}</h3>
            <div className="space-y-12">
              {featuredTopics.map((topic, index) => (
                <div key={index} className="space-y-6">
                  <h3 className="text-2xl font-bold text-slate-700">{topic.title}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6">
                    {topic.subItems.map((item, subIndex) => (
                      <div 
                        key={subIndex} 
                        className="bg-gradient-to-br from-navy-500 to-navy-800 text-white rounded-xl shadow-lg p-6"
                      >
                        <h4 className="text-xl font-semibold mb-3">{item.title}</h4>
                        <p className="text-gray-300">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expectations Section */}
        {expectations && expectations.length > 0 && (
          <ExpectationsSection 
            expectations={expectations} 
            expectationsText={expectationsText}
          />
        )}

        {/* Key Insights Section */}
        <div className="w-full">
          <h2 className="text-3xl font-semibold mb-6 text-slate-700">Key Insights</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {topicalCoverage.map((topic, index) => (
              <div
                key={index}
                className="bg-white backdrop-blur-sm p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 flex-grow-0 flex-shrink-0 basis-full sm:basis-[calc(50%-12px)] lg:basis-[calc(33.333%-16px)]"
              >
                <h3 className="text-balance text-lg font-bold mb-2 text-center text-navy-800">
                  {topic.tagline}
                </h3>
                <p className="text-balance text-base place-self-center text-gray-700">{topic.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Registration CTA */}
        <div className="mt-12 text-center flex flex-col items-center">
          <p className="text-2xl text-navy-500 mb-6 text-center mx-8">
            Act Now and Secure your Seat at this Groundbreaking Event!
          </p>
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