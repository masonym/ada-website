import React from 'react';
import { Award } from 'lucide-react';

type ExpectationItem = {
  title: string;
  description: string;
};

type AudienceExpectations = {
  audienceType: string;
  expectations: ExpectationItem[];
};

const ExpectationsSection: React.FC<{ expectations?: AudienceExpectations[] }> = ({ expectations }) => {
  if (!expectations || expectations.length === 0) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
      {expectations.map((audience, idx) => (
        <div key={idx} className="mb-12 last:mb-0 flex flex-col items-center">
          <h3 className="text-2xl font-bold text-slate-700 mb-6 flex items-center gap-2">
            <Award className="w-6 h-6 text-navy-600" />
            If you're a {audience.audienceType}...
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {audience.expectations.map((item, index) => (
              <div 
                key={index}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              >
                <h4 className="text-lg font-semibold text-navy-700 mb-3">
                  {item.title}
                </h4>
                <p className="text-gray-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExpectationsSection;