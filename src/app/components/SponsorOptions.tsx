import { SPONSORSHIP_TYPES } from '@/constants/sponsorships'
import React from 'react'
import { EventProps } from './Speakers'
import { notFound } from 'next/navigation'
import SponsorshipCard from './SponsorshipCard'
import Image from 'next/image'
import Link from 'next/link'
import Button from './Button'

export type SponsorProps = {
    event: EventProps;
}


const SponsorOptions = ({ event }: SponsorProps) => {
    const currentEvent = SPONSORSHIP_TYPES.find((e) => e.id === event.id);

    if (!currentEvent) {
        notFound();
    }

    return (
        <div className="max-container mx-auto pb-8 pt-0 px-4 flex flex-col items-center ">
            <div className="flex flex-col items-center">
                <h1 className="text-[48px] text-center font-gotham font-bold mb-2  text-slate-700">
                    Sponsorship Opportunities
                </h1>
                <p className="text-[20px] font-gotham text-slate-600 w-full mx-auto mb-6 text-center">
                    Increase your Brand Visibility and gain a Competitive Advantage!
                    {/* <br></br> Engaging in Sponsorship Opportunities is a Strategic way to effectively Promote your Products or Services. */}
                </p>
                <p className="text-[20px] font-gotham text-slate-600 w-full mx-auto mb-6 text-center">
                    Registered Sponsors: Please submit a high-quality logo for inclusion in the conference materials, along with the desired link for the logo on the event website, to <Link className="text-blue-600 hover:underline text-nowrap" href="mailto:marketing@americandefensealliance.org">marketing@americandefencealliance.org</Link>.
                </p>
                <div className="grid md:grid-cols-3 grid-cols-1 gap-8 justify-items-center md:justify-items-stretch items-stretch [&>*]:w-full">
                    {currentEvent.sponsorships.map((item, index) => (
                        <SponsorshipCard
                            key={index}
                            item={item}
                        >
                        </SponsorshipCard>
                    ))}
                </div>
                <p className="text-[16px] font-gotham text-slate-600 text-center w-full max-w-6xl mx-auto mb-6">
                    <b>Exhibitor Spaces:</b> The configuration of Exhibitor Areas varies by event and may encompass locations such as the General Session room, Pre-Function Areas, or a dedicated Exhibit Hall. For detailed information about each event, please reach out to us directly. Exhibitor Spaces are designed for table-top displays only, with no carpeting or pipe and drape required. Each Exhibitor will receive a 6' Table and Chairs. An Exhibit Space display area accommodates up to 8'x10'. We recommend using a maximum of (2) Pop-up Banners or (1) Backdrop. Please note that Electrical Services and other add-on items, including Internet Connections are not part of the Exhibit Space and will need to be purchased separately. A comprehensive Exhibitor Document will be available for download on the Event Page of our website.
                </p>
                <p className="text-[16px] font-gotham text-slate-600 text-center w-full max-w-2xl mx-auto mb-6">
                    Explore our discounted Sponsorship Opportunities available when you Register for Multiple Events. Inquire about Sponsorship Opportunities available without an Exhibit Space at a reduced rate. For more information and to secure your sponsorship, contact:  <a href="mailto:marketing@americandefensealliance.org" className='underline'>marketing@americandefensealliance.org</a>
                </p>
                <div className="mt-4 text-center flex flex-col items-center">
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
    )
}

export default SponsorOptions