import React from 'react';
import Link from 'next/link';
import { Printer } from 'lucide-react';

interface PrintScheduleButtonProps {
  eventId: number;
}

const PrintScheduleButton: React.FC<PrintScheduleButtonProps> = ({ eventId }) => {
  return (
    <Link
      href={`/print-layout/print-schedule/${eventId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
    >
      <Printer size={16} />
      <span>Printable Schedule</span>
    </Link>
  );
};

export default PrintScheduleButton;
