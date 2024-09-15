"use client"

import { NAV_LINKS } from "@/constants"
import Image from "next/image"
import Link from "next/link"
import Button from "./Button"
import { Menu } from 'lucide-react'
import { useState } from "react"
import Hamburger from "./Hamburger"

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  }

  return (
<<<<<<< Updated upstream
      <nav className="flexBetween max-container padding-container py-5 relative z-30 border-b-2 border-b-gray-700 ">
        <Link href="/">
          <div className="flexBetween maxContainer relative">
            <Image
              src="/logo.png"
              width={100}
              height={100}
              alt="ADA Logo"
            />
            <p className="pl-5 pr-5 font-bold text-xl font-gotham text-white">American Defense Alliance</p>
          </div>
        </Link>
        <ul className="hidden h-full gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
=======
    <nav className="flexBetween max-container padding-container py-5 relative z-30 border-b-gray-700">
      <Link href="/">
        <div className="flexBetween maxContainer relative">
          <Image
            src="/logo.png"
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
          return (
>>>>>>> Stashed changes
            <Link
              href={link.href}
              key={link.key}
              className="regular-16 text-gray-100 flexCenter cursor-pointer pb-1.5 transition-all hover:font-bold"
            >
              {link.label}
            </Link>
          ))}
        </ul>

        {/* <div className="lg:flexCenter hidden">
          <Button
            type="button"
            title="idk yet"
            icon="/logo.png"
            variant="btn_dark_green"
          />
        </div> */}

        <button onClick={toggleMenu} className="lg:hidden flex items-center justify-center">
          <Menu className="cursor-pointer" size={48} color="white"/>
        </button>

        <Hamburger
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
        />
      </nav>
  )
}

export default NavBar