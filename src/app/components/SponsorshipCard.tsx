import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Event } from '@/types/events';
import { getEventSponsors } from '@/constants/eventSponsors';
import { Sponsorship } from '@/types/sponsorships';
import FormattedPerk from '@/components/FormattedPerk';

type SponsorProp = {
    item: Sponsorship;
    event: Event;
    eyebrow?: string;
};

const SponsorshipCard = ({ item, event, eyebrow }: SponsorProp) => {
    const eventDateTime = new Date(`${event.date}T${event.timeStart}`);
    const hasEventEnded = eventDateTime < new Date();
    const eventSponsorsData = getEventSponsors(event.id);
    const showRemainingFlag = !!item.showRemaining;
    let remainingCount: number | undefined;
    if (item.slotsPerEvent !== undefined && eventSponsorsData) {
        const tierObj = eventSponsorsData.tiers.find(t => t.id === item.id || t.id === item.id + "-without-exhibit-space"); 
        const used = tierObj?.sponsorIds.length ?? 0;
        remainingCount = item.slotsPerEvent - used;
    }

    return (
        <div className="w-full h-full max-w-7xl mx-auto mb-6 rounded-lg border border-gray-200 bg-white shadow-md relative">
            {showRemainingFlag && remainingCount !== undefined && remainingCount > 0 && !hasEventEnded && (
                <div className="absolute -top-2 -right-4 overflow-visible z-1 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                    {remainingCount} remaining
                </div>
            )}
            {showRemainingFlag && remainingCount !== undefined && remainingCount <= 0 && !hasEventEnded && (
                <div className="absolute -top-2 -right-4 overflow-visible z-1 bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                    Sold Out
                </div>
            )}
            <div
                className={`flex items-center gap-4 rounded-t-lg justify-between p-4 ${item.colour || 'bg-navy-800'}`}
                style={item.colour ? { backgroundColor: item.colour } : undefined}
            >
                <div>
                    <h4 className="text-[1rem] font-bold text-white">{item.title}</h4>
                    {eyebrow && (
                        <span className="inline-block mb-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-[16px] font-semibold tracking-wide uppercase">
                            {eyebrow}
                        </span>
                    )}
                    {item.slotsPerEvent !== undefined && (
                        <p className="text-sm font-medium text-white">
                            {item.slotsPerEvent} available per event
                        </p>
                    )}
                </div>
                <span className="text-xl font-bold text-white">${item.cost.toLocaleString()}</span>
            </div>
            <div className="p-6">
                <ul className="space-y-4">
                    {item.perks.map((perk, index) => {
                        // Handle string perks directly
                        if (typeof perk === 'string') {
                            return (
                                <li key={index} className="flex items-start">
                                    <div>{perk}</div>
                                </li>
                            );
                        }
                        
                        // Handle formatted perks using FormattedPerk component
                        if (perk.formatted && perk.formatted.length > 0) {
                            // Convert formatted perks to the string format expected by FormattedPerk
                            const formattedContent = perk.formatted.map((formattedItem) => {
                                const prefix = formattedItem.indent ? '  '.repeat(formattedItem.indent) : '';
                                const content = formattedItem.bold ? 
                                    `<b>${formattedItem.content}</b>` : 
                                    formattedItem.content;
                                return `${prefix}${content}`;
                            }).join('\n');
                            
                            return (
                                <li key={index} className="flex items-start">
                                    <div className="flex-1">
                                        <FormattedPerk content={formattedContent} />
                                    </div>
                                </li>
                            );
                        }
                        
                        // Legacy format with tagline and description
                        return (
                            <li key={index} className="flex items-start">
                                <ChevronRight className="h-5 w-5 mr-2 text-navy-800 flex-shrink-0 mt-1" />
                                <div>
                                    {perk.tagline && <span className="font-bold">{perk.tagline}: </span>}
                                    {perk.description && (
                                        <span dangerouslySetInnerHTML={{ __html: perk.description }}></span>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

export default SponsorshipCard;
