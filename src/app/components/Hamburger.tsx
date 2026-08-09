import { NAV_LINKS } from "@/constants"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { ChevronDown, X } from 'lucide-react'
import type { EventLinkSummary } from "@/lib/events"

type HamburgerMenuProps = {
  isOpen: boolean,
  onClose: () => void,
  /**
   * Same list the desktop nav gets. This used to filter EVENTS itself on
   * `timeStart >= now` while the desktop nav filtered on `timeEnd >= now`, so an
   * event that had started but not finished disappeared from the mobile menu
   * while still showing on desktop.
   */
  upcomingEvents?: EventLinkSummary[]
}

const Hamburger = ({ isOpen, onClose, upcomingEvents = [] }: HamburgerMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  }

  const sortedEvents = upcomingEvents;

  return (
    <div
      ref={menuRef}
      className={`fixed top-0 right-0 h-full w-3/4 bg-gray-900 text-white z-40 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex flex-col p-6 h-full overflow-y-auto">
        {NAV_LINKS.map((link) => {
          if (link.key === 'upcoming_events') {
            return (
              <div key={link.key} className="mb-4">
                <button
                  onClick={toggleDropdown}
                  className="w-full text-left text-lg font-gotham py-2 text-gray-10 flexCenter cursor-pointer pb-1.5 transition-all hover:font-bold flex items-center justify-between"
                >
                  {link.label}
                  {isDropdownOpen ? <X size={20} /> : <ChevronDown size={20} />}
                </button>
                {isDropdownOpen && (
                  <ul className="mt-2 space-y-2 pl-4 text-center list-none">
                    {sortedEvents.map((event) => (
                      <li key={event.id}>
                        <Link
                          href={`/events/${event.slug}`}
                          className="block py-2 text-md font-bold text-gray-300 hover:text-white"
                          onClick={onClose}
                        >
                          {event.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          }
          return (
            <Link
              href={link.href}
              key={link.key}
              className="text-lg font-gotham py-2 text-gray-10 flexCenter cursor-pointer pb-1.5 transition-all hover:font-bold mb-4"
              onClick={onClose}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default Hamburger;