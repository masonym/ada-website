"use client";

import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Event } from "@/types/events";
import { Sponsorship } from "@/types/sponsorships";
import FormattedPerk from "@/components/FormattedPerk";
import { getPriceDisplay } from "@/lib/price-formatting";
import { getTierStyleProps } from "@/lib/sponsor-tier-styles";

type SponsorshipRowProps = {
  item: Sponsorship;
  event: Event;
  eyebrow?: string;
  getSponsorCount?: (tierId: string) => number;
  isOpen: boolean;
  onToggle: () => void;
};

/**
 * Full-width, collapsible presentation of a single sponsorship tier. Rows stack
 * vertically so the page layout no longer shifts when an event has a different
 * number of sponsorships (the old grid left ragged trailing rows).
 */
const SponsorshipRow = ({
  item,
  event,
  eyebrow,
  getSponsorCount,
  isOpen,
  onToggle,
}: SponsorshipRowProps) => {
  const eventDateTime = new Date(`${event.date}T${event.timeStart}`);
  const hasEventEnded = eventDateTime < new Date();
  const showRemainingFlag = !!item.showRemaining;
  let remainingCount: number | undefined;
  if (item.slotsPerEvent !== undefined && getSponsorCount) {
    const used = Math.max(
      getSponsorCount(item.id),
      getSponsorCount(item.id + "-without-exhibit-space"),
    );
    remainingCount = item.slotsPerEvent - used;
  }
  const showBadge =
    showRemainingFlag && remainingCount !== undefined && !hasEventEnded;

  const priceInfo = getPriceDisplay({
    price: item.cost,
    earlyBirdPrice: item.earlyBirdPrice,
    earlyBirdDeadline: item.earlyBirdDeadline,
    type: "paid",
  });
  const tierStyle = getTierStyleProps(item.colour, "bg-navy-800");
  const textColourClassName =
    item.textColour || (tierStyle.hasTextColour ? "" : "text-white");

  // Titles of the form "Prefix: Name" keep the prefix on its own line.
  const colonIndex = item.title.indexOf(": ");
  const titleNode =
    colonIndex !== -1 ? (
      <>
        {item.title.slice(0, colonIndex + 1)}
        <br />
        {item.title.slice(colonIndex + 2)}
      </>
    ) : (
      item.title
    );

  const panelId = `sponsorship-panel-${item.id}`;

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white shadow-md overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className={`w-full flex items-center gap-3 sm:gap-4 p-4 text-left ${tierStyle.className} ${textColourClassName} font-bold`}
        style={tierStyle.style}
      >
        <ChevronDown
          className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? "" : "-rotate-90"
          }`}
          aria-hidden="true"
        />
        <div className="flex-1 min-w-0">
          <h4 className="text-[1rem] font-bold">{titleNode}</h4>
          {eyebrow && (
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-white/20 text-[16px] font-semibold tracking-wide uppercase">
              {eyebrow}
            </span>
          )}
          {item.slotsPerEvent !== undefined && (
            <p className="text-sm font-medium">
              {item.slotsPerEvent} available per event
            </p>
          )}
        </div>
        {showBadge && (
          <span
            className={`hidden sm:inline-block flex-shrink-0 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md ${
              remainingCount! > 0 ? "bg-red-500" : "bg-gray-500"
            }`}
          >
            {remainingCount! > 0 ? `${remainingCount} remaining` : "Sold Out"}
          </span>
        )}
        <div className="flex-shrink-0 text-right">
          <div className="flex items-center justify-end gap-2 flex-wrap">
            <span className="text-xl font-bold">{priceInfo.displayPrice}</span>
            {priceInfo.originalPrice && (
              <span className="line-through text-base">
                {priceInfo.originalPrice}
              </span>
            )}
            {priceInfo.isEarlyBird && (
              <span className="ml-1 text-center text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wide">
                Early Bird
              </span>
            )}
          </div>
          {showBadge && (
            <span
              className={`sm:hidden inline-block mt-1 text-white text-xs font-bold px-2 py-0.5 rounded-full ${
                remainingCount! > 0 ? "bg-red-500" : "bg-gray-500"
              }`}
            >
              {remainingCount! > 0 ? `${remainingCount} remaining` : "Sold Out"}
            </span>
          )}
        </div>
      </button>

      {/* grid-rows trick animates the collapse without measuring content height */}
      <div
        id={panelId}
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="p-6">
            <ul className="space-y-4 md:columns-2 md:gap-10 md:space-y-0">
              {item.perks.map((perk, index) => {
                const liClass = "flex items-start md:break-inside-avoid";

                if (typeof perk === "string") {
                  return (
                    <li key={index} className={liClass}>
                      <div>{perk}</div>
                    </li>
                  );
                }

                if (perk.formatted && perk.formatted.length > 0) {
                  const formattedContent = perk.formatted
                    .map((formattedItem) => {
                      const prefix = formattedItem.indent
                        ? "  ".repeat(formattedItem.indent)
                        : "";
                      const content = formattedItem.bold
                        ? `<b>${formattedItem.content}</b>`
                        : formattedItem.content;
                      return `${prefix}${content}`;
                    })
                    .join("\n");

                  return (
                    <li key={index} className={liClass}>
                      <div className="flex-1">
                        <FormattedPerk content={formattedContent} />
                      </div>
                    </li>
                  );
                }

                return (
                  <li key={index} className={liClass}>
                    <ChevronRight className="h-5 w-5 mr-2 text-navy-800 flex-shrink-0 mt-1" />
                    <div>
                      {perk.tagline && (
                        <span className="font-bold">{perk.tagline}: </span>
                      )}
                      {perk.description && (
                        <span
                          dangerouslySetInnerHTML={{ __html: perk.description }}
                        ></span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SponsorshipRow;
