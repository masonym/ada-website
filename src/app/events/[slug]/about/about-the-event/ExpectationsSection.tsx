import React from 'react';
import { Award } from 'lucide-react';
import { AudienceExpectations } from '@/types/events';

type ExpectationsSectionProps = {
  expectations: AudienceExpectations[];
  expectationsText?: string;
};

const ExpectationsSection: React.FC<ExpectationsSectionProps> = ({ 
  expectations,
  expectationsText
}) => {
  if (!expectations || expectations.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center font-gotham text-slate-700 mb-2">
        What to Expect
      </h2>
      {expectationsText && (
        <p className="text-lg leading-relaxed text-center max-w-6xl mx-auto">
          {expectationsText}
        </p>
      )}
      {/* {expectations.map((audience, idx) => (
        <div key={idx} className="mb-12 last:mb-0 flex flex-col items-center">
          <h3 className="text-2xl font-bold text-slate-700 mb-6 flex items-center gap-2">
            <Award className="w-6 h-6 text-navy-600" />
            If you're a {audience.audienceType}...
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {audience.expectations.map((item, index) => (
              <div
                key={index}
                className={`bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 ${
                  index === audience.expectations.length - 1 && audience.expectations.length % 3 === 1 
                    ? 'lg:col-span-3 lg:w-1/2 lg:justify-self-center' 
                    : audience.expectations.length % 3 === 2 && (index === audience.expectations.length - 1 || index === audience.expectations.length - 2)
                    ? 'lg:col-span-3 lg:w-1/2 lg:justify-self-center'
                    : ''
                }`}
              >
                <h4 className="text-lg font-semibold mb-2 text-navy-500">{item.title}</h4>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      ))} */}
    </div>
  );
};

export default ExpectationsSection;