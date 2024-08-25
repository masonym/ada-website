import React from 'react';
import { ChevronRight } from 'lucide-react';

type RegistrationTypes = {
    title: string;
    subtitle: string;
    perks: string[];
    buttonText: string;
};

type RegistrationProp = {
    item: RegistrationTypes;
};

const RegistrationCard = ({ item }: RegistrationProp) => {
    return (
        <div className="w-full max-w-sm mx-auto overflow-hidden rounded-lg bg-white shadow-md">
            <div className="h-40 bg-gradient-to-r from-blue-900 to-blue-700 flex flex-wrap text-center items-center justify-center px-4">
                <h4 className="text-2xl font-bold text-white">{item.title}</h4>
            </div>
            <div className="p-6">
                <p className="text-sm text-gray-600 mb-4">{item.subtitle}</p>
                <ul className="space-y-2 mb-6">
                    {item.perks.map((perk, index) => (
                        <li key={index} className="flex items-start">
                            <ChevronRight className="h-5 w-5 mr-2 text-blue-600 flex-shrink-0" />
                            <span className="text-sm">{perk}</span>
                        </li>
                    ))}
                </ul>
                <button className="w-full py-2 px-4 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 transition duration-300">
                    {item.buttonText}
                </button>
            </div>
        </div>
    );
};

export default RegistrationCard;