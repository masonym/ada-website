"use client";

import { EVENT_NAVS } from '@/constants/eventNavs';
import { EVENTS } from '@/constants/events';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useRef, useState } from 'react';
import { Menu } from 'lucide-react'; // Import the Menu icon from lucide-react

export default function Navbar() {
    const params = useParams(); // Get the dynamic slug
    const eventId = EVENTS.find(event => event.slug === params?.slug)?.id; // Find the event ID based on the slug
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [dropdownIndex, setDropdownIndex] = useState<number | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = (index: number) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setDropdownIndex(index);
        setIsDropdownOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsDropdownOpen(false);
            setDropdownIndex(null);
        }, 200); // Adjust the delay as needed
    };

    const navItems = EVENT_NAVS.find(nav => nav.eventId === eventId)?.items || [];

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className="text-navy-800 text-[24px] mt-4 p-4">
            {/* Hamburger Icon for Mobile */}
            <div className="md:hidden flex items-center justify-between">
                <button onClick={toggleMobileMenu} className="focus:outline-none">
                    {/* Lucide Menu Icon */}
                    <Menu className="w-8 h-8 text-navy-800" />
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <ul className="md:hidden flex flex-col bg-gray-700 pl-8 rounded-md shadow-lg absolute left-0 right-0 z-10 mx-4 text-[16px]">
                    {params?.slug && navItems.map((navItem, index) => (
                        <li key={index} className="hover:bg-lightBlue-400 text-white p-2 rounded-md">
                            {navItem.subItems ? (
                                <>
                                    <Link href={`/events/${params.slug}/${navItem.path}`} className="cursor-pointer">
                                        {navItem.label}
                                    </Link>
                                    <ul className="mt-2 text-[14px]">
                                        {navItem.subItems.map(subItem => (
                                            <li key={subItem.path} className="hover:bg-gray-600 rounded-md px-4 py-2">
                                                <Link href={`/events/${params.slug}/about/${subItem.path}`}>
                                                    {subItem.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            ) : (
                                <Link href={`/events/${params.slug}/${navItem.path}`}>
                                    {navItem.label}
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {/* Desktop Menu */}
            <ul className="hidden md:flex space-x-4 relative items-center justify-center list-none">
                {params?.slug && navItems.map((navItem, index) => (
                    <li
                        key={index}
                        className="relative hover:bg-lightBlue-400 hover:text-white p-2 px-4 rounded-full"
                        onMouseEnter={() => handleMouseEnter(index)}
                        onMouseLeave={handleMouseLeave}
                    >
                        {navItem.subItems ? (
                            <>
                                <Link href={`/events/${params.slug}/${navItem.path}`} className="cursor-pointer">
                                    {navItem.label}
                                </Link>
                                {isDropdownOpen && dropdownIndex === index && (
                                    <ul className="mt-4 absolute left-1/2 -translate-x-1/2 bg-gray-700 rounded-md shadow-lg list-none">
                                        {navItem.subItems.map(subItem => (
                                            <li
                                                key={subItem.path}
                                                className="hover:bg-gray-600 hover:rounded-md px-12 py-4 text-white"
                                            >
                                                <Link href={`/events/${params.slug}/about/${subItem.path}`}>
                                                    {subItem.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </>
                        ) : (
                            <Link href={`/events/${params.slug}/${navItem.path}`}>
                                {navItem.label}
                            </Link>
                        )}
                    </li>
                ))}
            </ul>
        </nav>
    );
}