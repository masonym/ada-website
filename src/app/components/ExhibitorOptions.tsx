import { EXHIBITOR_TYPES } from '@/constants/exhibitors';
import React from 'react';
import { Event } from '@/types/events';
import { notFound } from 'next/navigation';
import ExhibitorCard from './ExhibitorCard';
import Link from 'next/link';
import Button from './Button';
import SponsorProspectus from './SponsorProspectus';
import SponsorLogos from './SponsorLogos';

export type ExhibitorProps = {
    event: Event;
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
                <p className="text-[20px] font-gotham text-slate-600 w-full mx-auto mb-6 text-center">
                    Increase your Brand Visibility and gain a Competitive Advantage!
                    {/* <br /> Engaging in Exhibitor Opportunities is a Strategic way to effectively Promote your Products or Services. */}
                </p>
                <SponsorProspectus event={event} />
                <p className="text-[20px] font-gotham text-slate-600 w-full mx-auto mb-6 text-center">
                    Registered Exhibitors: Please submit a high-quality logo for inclusion in the conference materials, along with the desired link for the logo on the event website, to <Link className="text-blue-600 hover:underline text-nowrap" href="mailto:marketing@americandefensealliance.org">marketing@americandefensealliance.org</Link>.
                </p>
                {currentEvent.exhibitors.map((item, index) => (
                    <ExhibitorCard
                        key={index}
                        item={item}
                    />
                ))}
                <p className="text-[16px] font-gotham text-slate-600 text-center w-full max-w-6xl mx-auto mb-6">
                    <b>Exhibitor Spaces:</b> The configuration of Exhibitor Areas varies by event and may encompass locations such as the General Session room, Pre-Function Areas, or a dedicated Exhibit Hall. For detailed information about each event, please reach out to us directly. Exhibitor Spaces are designed for table-top displays only, with no carpeting or pipe and drape required. Each Exhibitor will receive a 6' Table and Chairs. An Exhibit Space display area accommodates up to 8'x10'. We recommend using a maximum of (2) Pop-up Banners or (1) Backdrop. Please note that Electrical Services and other add-on items, including Internet Connections are not part of the Exhibit Space and will need to be purchased separately. A comprehensive Exhibitor Document will be available for download on the Event Page of our website.
                </p>
                <p className="text-[16px] font-gotham text-slate-600 text-center w-full max-w-2xl mx-auto mb-6">
                    Explore our discounted Exhibitor Opportunities available when you Register for Multiple Events. For more information and to secure your sponsorship, contact:  <a href="mailto:marketing@americandefensealliance.org" className='underline'>marketing@americandefensealliance.org</a>
                </p>

                <SponsorLogos event={event} showTiers={["Exhibitors"]} titleOverride=' ' />

                <div className="mt-4 text-center flex flex-col items-center">
                    <p className="text-2xl text-navy-500 mb-6 text-center mx-8">Act Now and Secure your Place at this Groundbreaking Event!</p>
                    <Button
                        title="REGISTER"
                        variant="btn_blue"
                        link={event.registerLink}
                        className="max-w-xs sm:max-w-sm"
                    />
                </div>
            </div>
        </div>
    );
};

export default ExhibitorOptions;