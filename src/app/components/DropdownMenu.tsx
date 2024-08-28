import Link from "next/link"
import { ChevronDown } from 'lucide-react'
import { EVENTS } from "@/constants/events"

type DropdownMenuProps = {
  link: { key: string; label: string; href: string }
  isOpen: boolean
  onToggle: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  dropdownRef: React.RefObject<HTMLLIElement>
  onUpcomingEventsClick: (e: React.MouseEvent) => void
}

const DropdownMenu = ({ link, isOpen, onToggle, onMouseEnter, onMouseLeave, dropdownRef, onUpcomingEventsClick }: DropdownMenuProps) => {
  return (
    <li
      ref={dropdownRef}
      className="relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Link
        href={link.href}
        className="regular-16 text-gray-100 flexCenter cursor-pointer pb-1.5 transition-all hover:font-bold"
        onClick={(e) => {
          onUpcomingEventsClick(e);
          onToggle();
        }}
      >
        {link.label} <ChevronDown className="ml-1" size={16} />
      </Link>
      {isOpen && (
        <ul className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-auto rounded-md shadow-lg bg-white list-none">
          {EVENTS.map((event) => (
            <li key={event.id} className="py-1 whitespace-nowrap">
              <Link
                href={`/events/${event.slug}`}
                className="block px-4 py-2 text-md font-bold text-gray-700 hover:bg-gray-100"
              >
                {event.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export default DropdownMenu;