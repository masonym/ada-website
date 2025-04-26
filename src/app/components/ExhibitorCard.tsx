import React from 'react';
import { ChevronRight } from 'lucide-react';

type Perk = {
    tagline: string;
    description: string;
};

type ExhibitorTypes = {
    title: string;
    cost: string;
    perks: Perk[];
    colour?: string;
    slotsPerEvent?: number;
};

type ExhibitorProp = {
    item: ExhibitorTypes;
};

const ExhibitorCard = ({ item }: ExhibitorProp) => {
    return (
        <div className="w-full max-w-5xl mx-auto mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
            <div
                className={`flex items-center gap-4 justify-between p-4 ${item.colour || 'bg-navy-800'}`}
                style={item.colour ? { backgroundColor: item.colour } : undefined}
            >
                <div>
                    <h4 className="text-[1rem] font-bold text-white">{item.title}</h4>
                    {item.slotsPerEvent !== undefined && (
                        <p className="text-sm font-medium text-white">
                            {item.slotsPerEvent} available per event
                        </p>
                    )}
                </div>
                <span className="text-xl font-bold text-white">{item.cost}</span>
            </div>
            <div className="p-6">
                <ul className="space-y-4">
                    {item.perks.map((perk, index) => (
                        <li key={index} className="flex items-start">
                            <ChevronRight className="h-5 w-5 mr-2 text-navy-800 flex-shrink-0 mt-1" />
                            <div>
                                <span className="font-bold">{perk.tagline}: </span>
                                <span>{perk.description}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ExhibitorCard;
