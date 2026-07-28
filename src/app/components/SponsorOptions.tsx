"use client";

import { SPONSORSHIP_TYPES } from "@/constants/sponsorships";
import React, { useState } from "react";
import { useEventSponsorCounts } from "@/hooks/useEventSponsorCounts";
import { Event } from "@/types/events";
import { notFound } from "next/navigation";
import SponsorshipCard from "./SponsorshipCard";
import Image from "next/image";
import Link from "next/link";
import Button from "./Button";
import SponsorProspectus from "./SponsorProspectus";
import ExhibitInstructionsButton from "./ExhibitInstructionsButton";
import RegistrationModal from "@/components/RegistrationModal";
import { getSponsorshipsForEvent } from "@/lib/registration-adapters";
import { findTierStyle } from "@/lib/sponsor-tier-styles";
import EventFloorPlan from "./EventFloorPlan";

export type SponsorProps = {
  event: Event;
  sponsorTierStyles?: Record<string, string>;
};

const SponsorOptions = ({ event, sponsorTierStyles }: SponsorProps) => {
  const currentEvent = SPONSORSHIP_TYPES.find((e) => e.id === event.id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { getSponsorCount } = useEventSponsorCounts(event.id);

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

  const visibleSponsorships = currentEvent.sponsorships.filter(
    (item) => item.showOnSponsorshipPage !== false,
  );
  const primeSponsor = currentEvent.primeSponsor
    ? {
        ...currentEvent.primeSponsor,
        colour:
          findTierStyle(sponsorTierStyles, currentEvent.primeSponsor.id) ||
          currentEvent.primeSponsor.colour,
      }
    : undefined;
  const sponsorshipsWithCmsStyles = visibleSponsorships.map((item) => ({
    ...item,
    colour: findTierStyle(sponsorTierStyles, item.id) || item.colour,
  }));

  // Split out any grouped sponsorships (e.g. "Major Panel Sponsorships") so they
  // render as their own titled section below the main grid instead of flowing
  // into it and starting mid-row. Ungrouped tiers keep the original layout.
  const ungroupedSponsorships = sponsorshipsWithCmsStyles.filter(
    (item) => !item.sponsorshipGroup,
  );
  const groupOrder: string[] = [];
  const groupedSponsorships: Record<string, typeof sponsorshipsWithCmsStyles> =
    {};
  for (const item of sponsorshipsWithCmsStyles) {
    if (!item.sponsorshipGroup) continue;
    if (!groupedSponsorships[item.sponsorshipGroup]) {
      groupedSponsorships[item.sponsorshipGroup] = [];
      groupOrder.push(item.sponsorshipGroup);
    }
    groupedSponsorships[item.sponsorshipGroup].push(item);
  }

  const defaultExhibitorText = (
    <>
      The configuration of Exhibitor Areas varies by event and may encompass
      locations such as the General Session room, Pre-Function Areas, or a
      dedicated Exhibit Hall. For detailed information about each event, please
      reach out to us directly. Exhibitor Spaces are designed for table-top
      displays only, with no carpeting or pipe and drape required. Each
      Exhibitor will receive a 6' Table and Chairs. An Exhibit Space display
      area accommodates up to 8'x10'. We recommend using a maximum of (2) Pop-up
      Banners or (1) Backdrop. Please note that Electrical Services and other
      add-on items, including Internet Connections are not part of the Exhibit
      Space and will need to be purchased separately. A comprehensive Exhibitor
      Document will be available for download on the Event Page of our website.
    </>
  );

  const defaultSponsorText = (
    <>
      Explore our discounted Sponsorship Opportunities available when you
      Register for Multiple Events. Inquire about Sponsorship Opportunities
      available without an Exhibit Space at a reduced rate. For more information
      and to secure your sponsorship, contact:{" "}
      <a
        href="mailto:events@americandefensealliance.org"
        className="underline break-words"
      >
        events@americandefensealliance.org
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
          <p className="text-[20px] font-gotham text-slate-600 w-full mx-auto mb-2 text-center">
            Registered Sponsors: Please submit a high-quality logo for inclusion
            in the conference materials, along with the desired link for the
            logo on the event website, to{" "}
            <Link
              className="text-blue-600 hover:underline break-words"
              href="mailto:events@americandefensealliance.org"
            >
              events@americandefensealliance.org
            </Link>
            .
          </p>
          {/* Event Floorplan Section */}
          {event.id === 4 && (
            <EventFloorPlan
              eventId={event.id}
              floorPlanImage={`/events/${event.eventShorthand}/event-floorplan.webp`}
            />
          )}
          {primeSponsor && (
            <div className="mb-8 w-full">
              <div className="flex justify-center">
                <SponsorshipCard
                  item={primeSponsor}
                  event={event}
                  getSponsorCount={getSponsorCount}
                />
              </div>
            </div>
          )}

          {/* Main sponsorship grid (grouped tiers are rendered in their own sections below). */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            {ungroupedSponsorships.map((item, index) => (
              <div
                key={index}
                className={`flex justify-center ${
                  ungroupedSponsorships.length % 3 === 1 &&
                  index === ungroupedSponsorships.length - 1
                    ? "md:col-span-3"
                    : ""
                }`}
              >
                <SponsorshipCard
                  item={item}
                  event={event}
                  getSponsorCount={getSponsorCount}
                />
              </div>
            ))}
          </div>

          {/* Grouped sponsorship sections (e.g. Major Panel Sponsorships) — each as its own titled block. */}
          {groupOrder.map((groupName) => (
            <div key={groupName} className="w-full mt-12">
              <h2 className="text-3xl sm:text-4xl font-gotham font-bold text-center text-slate-700 mb-2">
                {groupName}
              </h2>
              <p className="text-[18px] font-gotham text-slate-600 text-center mb-6 max-w-4xl mx-auto">
                Each panel has a single Sponsor which may contribute the
                Moderator for the panel discussion during the General Session.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full items-start">
                {groupedSponsorships[groupName].map((item, index) => (
                  <div key={index} className="flex justify-center">
                    <SponsorshipCard
                      item={item}
                      event={event}
                      getSponsorCount={getSponsorCount}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <p className="text-[16px] mt-4 font-gotham text-slate-600 text-center w-full max-w-6xl mx-auto mb-6">
            <b>Exhibitor Spaces:</b>{" "}
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

          <div className="mt-4 text-center flex flex-col items-center">
            <p className="text-2xl text-navy-500 mb-6 text-center mx-8">
              Act Now and Secure your Place at this Groundbreaking Event!
            </p>
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
  );
};

export default SponsorOptions;
