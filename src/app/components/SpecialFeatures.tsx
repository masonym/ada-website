import React from 'react';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { SPECIAL_FEATURES } from '@/constants/specialFeatures';
import { EventProps } from './Speakers';




type SpecialFeaturesProps = {
    event: EventProps;
};

const SpecialFeatures: React.FC<SpecialFeaturesProps> = ({ event }) => {
    const eventFeatures = SPECIAL_FEATURES.find(ef => ef.id === event.id);

    if (!eventFeatures) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center">
            <h2 className="text-4xl font-bold text-navy-800 mb-8 text-center">Conference Special Features</h2>

            <div className="grid md:gap-8 gap-4 md:grid-cols-2 items-start">
                {eventFeatures.features.map((feature, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold text-navy-800 mb-4">{feature.title}</h3>

                        {(feature.date || feature.time) && (
                            <div className="flex items-center gap-2 text-gray-600 mb-2">
                                <Calendar className="h-5 w-5" />
                                <span>{feature.date} {feature.time && `| ${feature.time}`}</span>
                            </div>
                        )}

                        {feature.location && (
                            <div className="flex items-center gap-2 text-gray-600 mb-4">
                                <MapPin className="h-5 w-5" />
                                <span dangerouslySetInnerHTML={{__html: feature.location}}></span>
                            </div>
                        )}

                        <p className="text-gray-600">{feature.description}</p>
                    </div>
                ))}
                {eventFeatures.additionalPerks && eventFeatures.additionalPerks.length > 0 && (
                    <div className="mt-0 bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-navy-800 mb-4">Additional Perks</h3>
                        <ul className="space-y-2">
                            {eventFeatures.additionalPerks.map((perk, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <div className="rounded-full bg-blue-500 w-2 h-2 mt-2 flex-shrink-0" />
                                    <span>{perk}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

        </div>
    );
};

export default SpecialFeatures;