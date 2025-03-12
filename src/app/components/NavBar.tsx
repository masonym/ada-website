"use client"

import { NAV_LINKS } from "@/constants"
import { EVENTS } from "@/constants/events"
import Image from "next/image"
import Link from "next/link"
import { Menu, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from "react"
import Hamburger from "./Hamburger"
import { getCdnPath } from "@/utils/image"
import { isEventUpcoming } from "@/app/components/UpcomingEvents"

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);


  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false);
    }
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 300);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const now = new Date();
  const upcomingEvents = [...EVENTS]
    .filter(event => {
      // First, check if the event has a timeStart
      if (!event.timeStart) return false;

      // Use the safer isEventUpcoming function
      return isEventUpcoming(event.date, event.timeStart, now);
    })
    .sort((a, b) => {
      const dateA = new Date(a.timeStart);
      const dateB = new Date(b.timeStart);
      return dateA.getTime() - dateB.getTime();
    });

  return (
    <nav className="flexBetween max-container padding-container py-5 relative z-30 border-b-gray-700">
      <Link href="/">
        <div className="flexBetween maxContainer relative">
          <Image
            src={getCdnPath("/logo.webp")}
            width={100}
            height={100}
            alt="American Defense Alliance Logo"
          />
          <p className="pl-5 pr-5 font-bold text-xl font-gotham text-white">American Defense Alliance</p>
        </div>
      </Link>
      <ul className="hidden h-full gap-8 lg:flex list-none">
        {NAV_LINKS.map((link) => {
          if (link.key === 'upcoming_events') {
            return (
              <li
                key={link.key}
                ref={dropdownRef}
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href={link.href}
                  className="regular-16 text-gray-100 flexCenter cursor-pointer pb-1.5 transition-all hover:font-bold"
                >
                  {link.label} <ChevronDown className="ml-1" size={16} />
                </Link>
                {isDropdownOpen && (
                  <ul className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-auto rounded-md shadow-lg bg-white list-none">
                    {upcomingEvents.map((event) => (
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
          return (
            <Link
              href={link.href}
              key={link.key}
              className="regular-16 text-gray-100 flexCenter cursor-pointer pb-1.5 transition-all hover:font-bold"
            >
              {link.label}
            </Link>
          );
        })}
      </ul>

      <button onClick={toggleMenu} className="lg:hidden flex items-center justify-center">
        <Menu className="cursor-pointer" size={48} color="white" />
      </button>

      <Hamburger
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    </nav>
  )
}

export default NavBar
