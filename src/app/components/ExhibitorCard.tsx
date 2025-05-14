import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Event } from '@/types/events';
import { getEventSponsors } from '@/constants/eventSponsors';

type Perk = {
    tagline: string;
    description: string;
};

type ExhibitorTypes = {
    id: string;
    title: string;
    cost: string;
    perks: Perk[];
    colour?: string;
    slotsPerEvent?: number;
    showRemaining?: boolean;
};

type ExhibitorProp = {
    item: ExhibitorTypes;
    event: Event;
};

const ExhibitorCard = ({ item, event }: ExhibitorProp) => {
    const eventDateTime = new Date(`${event.date}T${event.timeStart}`);
    const hasEventEnded = eventDateTime < new Date();
    const eventSponsorsData = getEventSponsors(event.id);
    const showRemainingFlag = !!item.showRemaining;
    let remainingCount: number | undefined;
    if (item.slotsPerEvent !== undefined && eventSponsorsData) {
        const tierObj = eventSponsorsData.tiers.find(t => t.id === item.id);
        const used = tierObj?.sponsorIds.length ?? 0;
        remainingCount = item.slotsPerEvent - used;
    }
    return (
        <div className="w-full max-w-5xl mx-auto mb-6 rounded-lg border border-gray-200 bg-white shadow-md relative">
            {showRemainingFlag && remainingCount !== undefined && remainingCount > 0 && !hasEventEnded && (
                <div className="absolute -top-2 -right-4 overflow-visible z-1 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                    {remainingCount} remaining
                </div>
            )}
            <div
                className={`flex items-center rounded-t-lg gap-4 justify-between p-4 ${item.colour || 'bg-navy-800'}`}
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
