import { EXHIBITOR_TYPES } from '@/constants/exhibitors';
import React from 'react';
import { EventProps } from './Speakers';
import { notFound } from 'next/navigation';
import ExhibitorCard from './ExhibitorCard';

export type ExhibitorProps = {
    event: EventProps;
};

const ExhibitorOptions = ({ event }: ExhibitorProps) => {
    const currentEvent = EXHIBITOR_TYPES.find((e) => e.id === event.id);

    if (!currentEvent) {
        notFound();
    }

    return (
        <div className="max-container mx-auto pb-8 pt-0 px-4 flex flex-col items-center">
            <div className="flex flex-col items-center">
                <h1 className="text-[48px] text-center font-gotham font-bold mb-2 text-slate-700">
                    Exhibitor Opportunities
                </h1>
                <p className="text-[20px] font-gotham text-slate-600 w-full max-w-4xl mx-auto mb-6 text-center">
                    Showcase your products and services at our premier defense industry event. <br /> We are pleased to offer the following Exhibitor Opportunities.
                </p>
                {currentEvent.exhibitors.map((item, index) => (
                    <ExhibitorCard
                        key={index}
                        item={item}
                    />
                ))}
                <p className="text-[16px] font-gotham text-slate-600 text-center w-full max-w-2xl mx-auto mb-6">
                    For more information about exhibitor opportunities, contact: <br />
                    <a href="mailto:marketing@americandefensealliance.org" className='underline'>
                        marketing@americandefensealliance.org
                    </a>
                </p>
            </div>
        </div>
    );
};

export default ExhibitorOptions;