'use client';

import { AdapterModalRegistrationType } from '@/lib/registration-adapters';
import { getPriceDisplay } from '@/lib/price-formatting';

interface PriceDisplayProps {
  registration: AdapterModalRegistrationType;
  className?: string;
}

/**
 * Component for consistently displaying price information across the site
 */
const PriceDisplay: React.FC<PriceDisplayProps> = ({ registration, className = '' }) => {
  const priceInfo = getPriceDisplay(registration);

  return (
    <div className={className}>
      <div className="text-lg font-semibold flex flex-wrap items-center">
        <span className={`${priceInfo.priceClasses} mr-2`}>
          {priceInfo.displayPrice}
        </span>

        {priceInfo.originalPrice && (
          <span className="line-through text-gray-500 text-base">
            {priceInfo.originalPrice}
          </span>
        )}

        {priceInfo.priceLabel && (
          <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
            {priceInfo.priceLabel}
          </span>
        )}
      </div>

      {priceInfo.deadlineInfo && (
        <div className="text-xs text-gray-500 mt-1">
          {priceInfo.deadlineInfo}
        </div>
      )}
    </div>
  );

};

export default PriceDisplay;
