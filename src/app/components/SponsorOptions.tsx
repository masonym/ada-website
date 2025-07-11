'use client';

import { SPONSORSHIP_TYPES } from '@/constants/sponsorships'
import React, { useState } from 'react'
import { Event } from '@/types/events'
import { notFound } from 'next/navigation'
import SponsorshipCard from './SponsorshipCard'
import Image from 'next/image'
import Link from 'next/link'
import Button from './Button'
import SponsorProspectus from './SponsorProspectus'
import SponsorLogos from './SponsorLogos'
import ExhibitInstructionsButton from './ExhibitInstructionsButton'
import RegistrationModal from '@/components/RegistrationModal'
import { getSponsorshipsForEvent } from '@/lib/registration-adapters'

export type SponsorProps = {
    event: Event;
}


const SponsorOptions = ({ event }: SponsorProps) => {
    const currentEvent = SPONSORSHIP_TYPES.find((e) => e.id === event.id);
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!currentEvent) {
        notFound();
    }
    
    const handleOpenRegistration = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };
    
    const sponsorOptions = getSponsorshipsForEvent(event.id);

    const defaultExhibitorText = (
        <>
            The configuration of Exhibitor Areas varies by event and may encompass locations such as
            the General Session room, Pre-Function Areas, or a dedicated Exhibit Hall. For detailed
            information about each event, please reach out to us directly. Exhibitor Spaces are
            designed for table-top displays only, with no carpeting or pipe and drape required.
            Each Exhibitor will receive a 6' Table and Chairs. An Exhibit Space display area
            accommodates up to 8'x10'. We recommend using a maximum of (2) Pop-up Banners or (1)
            Backdrop. Please note that Electrical Services and other add-on items, including
            Internet Connections are not part of the Exhibit Space and will need to be purchased
            separately. A comprehensive Exhibitor Document will be available for download on the
            Event Page of our website.
        </>
    );

    const defaultSponsorText = (
        <>
            Explore our discounted Sponsorship Opportunities available when you Register for Multiple
            Events. Inquire about Sponsorship Opportunities available without an Exhibit Space at a
            reduced rate. For more information and to secure your sponsorship, contact:{' '}
            <a href="mailto:marketing@americandefensealliance.org" className='underline break-words'>
                marketing@americandefensealliance.org
            </a>
        </>
    );

    return (
        <div className="w-full overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center">
                    <h1 className="text-[48px] text-center font-gotham font-bold mb-2  text-slate-700">
                        Sponsorship Opportunities
                    </h1>
                    <p className="text-[20px] font-gotham text-slate-600 w-full mx-auto mb-6 text-center px-4">
                        Increase your Brand Visibility and gain a Competitive Advantage!
                        {/* <br></br> Engaging in Sponsorship Opportunities is a Strategic way to effectively Promote your Products or Services. */}
                    </p>
                    <div className="mb-4 text-center flex flex-col items-center">
                        <Button
                            title="Sign-up Here to Sponsor"
                            variant="btn_red"
                            onClick={handleOpenRegistration}
                            className="max-w-xs sm:max-w-sm"
                        />
                    </div>
                    <ExhibitInstructionsButton eventShorthand={event.eventShorthand} />
                    <SponsorProspectus eventShorthand={event.eventShorthand} />
                    <p className="text-[20px] font-gotham text-slate-600 w-full mx-auto mb-6 text-center">
                        Registered Sponsors: Please submit a high-quality logo for inclusion in the conference materials, along with the desired link for the logo on the event website, to <Link className="text-blue-600 hover:underline break-words" href="mailto:events@americandefensealliance.org">events@americandefensealliance.org</Link>.
                    </p>
                    {currentEvent.primeSponsor && (
                        <div className="mb-8 w-full">
                            <h2 className="text-3xl font-bold text-center text-slate-800 mb-4">
                                EXCLUSIVE
                            </h2>
                            <div className="flex justify-center">
                                <SponsorshipCard item={currentEvent.primeSponsor} event={event} />
                            </div>
                        </div>
                    )}

                    {/* this prop isn't required, so we want to only filter ones out that are EXPLICITLY FALSE */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                        {currentEvent.sponsorships
                        .filter((item) => item.showOnSponsorshipPage !== false)
                        .map((item, index) => (
                            <div key={index} className="flex justify-center">
                                <SponsorshipCard item={item} event={event} />
                            </div>
                        ))}
                    </div>
                    <p className="text-[16px] mt-4 font-gotham text-slate-600 text-center w-full max-w-6xl mx-auto mb-6">
                        <b>Exhibitor Spaces:</b>{' '}
                        {event.sponsorshipInfo?.exhibitorSpacesText || defaultExhibitorText}
                    </p>

                    <p className="text-[16px] font-gotham text-slate-600 text-center w-full max-w-2xl mx-auto mb-6">
                        {event.sponsorshipInfo?.sponsorSection || defaultSponsorText}
                    </p>

                    {event.sponsorshipInfo?.customContactText && (
                        <p className="mt-4 text-[16px] font-gotham text-slate-600 text-center w-full max-w-2xl mx-auto">
                            {event.sponsorshipInfo?.customContactText}
                        </p>
                    )}

                    <SponsorLogos event={event} showTiers={['Sponsor', 'Partner']} />

                    <div className="mt-4 text-center flex flex-col items-center">
                        <p className="text-2xl text-navy-500 mb-6 text-center mx-8">Act Now and Secure your Place at this Groundbreaking Event!</p>
                        <Button
                            title="REGISTER"
                            variant="btn_blue"
                            onClick={handleOpenRegistration}
                            className="max-w-xs sm:max-w-sm"
                        />
                    </div>
                </div>
                
                {/* Registration Modal */}
                {sponsorOptions && sponsorOptions.length > 0 && (
                    <RegistrationModal
                        isOpen={isModalOpen}
                        onClose={handleCloseModal}
                        selectedRegistration={sponsorOptions[0]}
                        event={event}
                    />
                )}
            </div>
        </div>
    )
}

export default SponsorOptions
