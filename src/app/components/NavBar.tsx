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
    <>
      <nav className="flexBetween max-container px-3 py-5 lg:px-10 3xl:px-0 relative z-30">
        <Link href="/">
          <div className="flexBetween maxContainer relative">
            <Image
              src="/logo.png"
              width={100}
              height={100}
              alt="ADA Logo"
            />
            <p className="pl-5 pr-5 font-bold text-xl font-gotham">American Defense Alliance</p>
          </div>
        </Link>
        <ul className="hidden h-full gap-12 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              href={link.href}
              key={link.key}
              className="regular-16 text-gray-50 flexCenter cursor-pointer pb-1.5 transition-all hover:font-bold"
            >
              {link.label}
            </Link>
          ))}
        </ul>

        <div className="lg:flexCenter hidden">
          <Button
            type="button"
            title="idk yet"
            icon="/logo.png"
            variant="btn_dark_green"
          />
        </div>

        <button onClick={toggleMenu} className="lg:hidden flex items-center justify-center">
          <Menu className="cursor-pointer" size={48} />
        </button>

        <Hamburger
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
        />
      </nav>
      <hr className="h-px mb-4 bg-gray-200 border-0 dark:bg-gray-700 flexBetween max-container px-2 lg:px-10 3xl:px-0 relative z-30">
      </hr>
    </>
  )
}

export default NavBar