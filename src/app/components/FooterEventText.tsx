import React from 'react';
import { EventProps } from './Speakers';

type FooterEventTextProps = {
  event: EventProps;
};

const FooterEventText = ({ event }: FooterEventTextProps) => {
  if (!event.customFooterText) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4">
      {/* Render sponsor section if it exists */}
      {event.customFooterText && (
        <div className="max-w-2xl text-center text-slate-700">
          {event.customFooterText}
        </div>
      )}

    </div>
  );
};

export default FooterEventText;