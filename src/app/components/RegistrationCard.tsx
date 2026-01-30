"use client";

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import RegistrationModal from '@/components/RegistrationModal';
import { getCdnPath } from '@/utils/image';
import PriceDisplay from '@/components/PriceDisplay';
import { AdapterModalRegistrationType } from '@/lib/registration-adapters';
import { Event } from '@/types/events';
import FormattedPerk from '@/components/FormattedPerk';

// Use the ModalRegistrationType from our adapter
type RegistrationCardProps = AdapterModalRegistrationType;

type RegistrationProp = {
  item: RegistrationCardProps;
  event: Event;
};

const RegistrationCard = ({ item, event }: RegistrationProp) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isPaid = item.type === 'paid';
  const isFree = item.type === 'free';
  const isSponsor = item.type === 'sponsor';
  const isSoldOut = item.availabilityInfo === 'SOLD OUT';
  const isEarlyBird = isPaid && item.earlyBirdDeadline && new Date() < new Date(item.earlyBirdDeadline);

  const currentPrice = isPaid
    ? (isEarlyBird && item.earlyBirdPrice ? item.earlyBirdPrice : item.price)
    : isFree
      ? 'Complimentary'
      : '';
  const deadlineDate = isPaid && item.earlyBirdDeadline
    ? new Date(item.earlyBirdDeadline).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    : null;

  const handleCardClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    if (item.buttonLink) {
      window.open(item.buttonLink, '_blank', 'noopener,noreferrer');
      return;
    }
    // Open the modal if no button link is provided
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div
        className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden max-w-sm mx-auto h-full cursor-pointer hover:shadow-lg transition-shadow"
        onClick={handleCardClick}
      >
        {/* Image container */}
        <div className="relative w-full aspect-[2/1]">
          <Image
            src={getCdnPath(`events/${event.eventShorthand}/registration-cards/${item.headerImage}`)}
            alt={item.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Content */}
        <div className="flex flex-col flex-grow p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">{item.title}</h3>
          {item.subtitle && <p className="text-gray-600 mb-4">{item.subtitle}</p>}


          {/* Perks */}
          <ul className="space-y-2 mb-6">
            {item.perks?.map((perk, index) => (
              <li key={index} className="flex items-start">
                {/* <ChevronRight className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" /> */}
                <div className="text-sm text-gray-700">
                  <FormattedPerk content={perk} />
                </div>
              </li>
            ))}
          </ul>

          {/* Price Display */}
          <div className="mt-auto mx-auto mb-4">
            <PriceDisplay registration={item} className="text-center" />
          </div>

          {/* Additional Info */}
          <div className=" text-center">
            {isPaid && item.receptionPrice && (
              <p className="text-sm font-medium text-blue-600">
                {item.receptionPrice} with VIP Networking Reception
              </p>
            )}

            {isFree && (
              <p className="text-sm font-medium text-gray-600">
                Register with .gov or .mil email
              </p>
            )}

            {isSponsor && (
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-600">Contact us for sponsorship details</p>
              </div>
            )}

            {item.availabilityInfo && !isSoldOut && (
              <p className="text-xs text-yellow-600 mt-2">
                {item.availabilityInfo}
              </p>
            )}
          </div>

          {/* Button */}
          <div className="">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick(e);
              }}
              disabled={isSoldOut}
              className={`w-full py-2 px-4 text-white font-semibold rounded-md ${isSoldOut
                ? 'bg-gray-400 cursor-not-allowed'
                : isSponsor
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : isFree
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                } transition-colors`}
            >
              {isSoldOut ? 'Sold Out' : item.buttonText}
            </button>
          </div>


        </div>
      </div>

      {/* Registration Modal */}
      <RegistrationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        selectedRegistration={item}
        event={event}
      />
    </>
  );
};

export default RegistrationCard;
