import { SPONSORSHIP_TYPES } from '@/constants/sponsorships'
import React from 'react'
import { Event } from '@/types/events'
import { notFound } from 'next/navigation'
import SponsorshipCard from './SponsorshipCard'
import Image from 'next/image'
import Link from 'next/link'
import Button from './Button'
import SponsorProspectus from './SponsorProspectus'
import SponsorLogos from './SponsorLogos'

export type SponsorProps = {
    event: Event;
}


const SponsorOptions = ({ event }: SponsorProps) => {
    const currentEvent = SPONSORSHIP_TYPES.find((e) => e.id === event.id);

    if (!currentEvent) {
        notFound();
    }

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
                    <SponsorProspectus event={event} />
                    <p className="text-[20px] font-gotham text-slate-600 w-full mx-auto mb-6 text-center">
                        Registered Sponsors: Please submit a high-quality logo for inclusion in the conference materials, along with the desired link for the logo on the event website, to <Link className="text-blue-600 hover:underline break-words" href="mailto:marketing@americandefensealliance.org">marketing@<wbr />americandefensealliance.org</Link>.
                    </p>
                    <div className="grid md:grid-cols-3 grid-cols-1 gap-8 justify-items-stretch items-stretch">
                        {currentEvent.sponsorships.map((item, index) => {
                            const isLastRow = index >= Math.floor(currentEvent.sponsorships.length / 3) * 3;
                            const isLastRowCenter = currentEvent.sponsorships.length % 3 === 1;
                            const isLastRowTwoItems = currentEvent.sponsorships.length % 3 === 2;

                            return (
                                <div
                                    key={index}
                                    className={`
                    ${isLastRow && isLastRowCenter ? 'md:col-start-2' : ''}
                    ${isLastRow && isLastRowTwoItems ? 'md:col-span-1 first:md:col-start-2' : ''}
                `}
                                >
                                    <SponsorshipCard item={item} />
                                </div>
                            );
                        })}
                    </div>
                    <p className="text-[16px] mt-4 font-gotham text-slate-600 text-center w-full max-w-6xl mx-auto mb-6">
                        <b>Exhibitor Spaces:</b>{' '}
                        {event.sponsorshipInfo?.exhibitorSpacesText || defaultExhibitorText}
                    </p>

                    <p className="text-[16px] font-gotham text-slate-600 text-center w-full max-w-2xl mx-auto mb-6">
                        {event.sponsorshipInfo?.sponsorSection || defaultSponsorText}
                    </p>
                    
                    <p className="text-[16px] font-gotham text-slate-600 text-center w-full max-w-2xl mx-auto">
                        {event.sponsorshipInfo?.customContactText}
                    </p>


                    <SponsorLogos event={event} showTiers={["Event Partners", "Gold Sponsor", "Silver Sponsors"]} titleOverride='This Event is Organized and Presented by' />

                    <div className="mt-8 text-center flex flex-col items-center">
                        <p className="text-2xl text-navy-500 mb-6 text-center mx-8">Act Now and Secure your Seat at this Groundbreaking Event!</p>
                        <Button
                            title="REGISTER"
                            variant="btn_blue"
                            link={event.registerLink}
                            className="max-w-xs sm:max-w-sm"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SponsorOptions