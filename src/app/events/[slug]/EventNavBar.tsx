"use client";

import { EVENT_NAVS } from '@/constants/eventNavs';
import { EVENTS } from '@/constants/events';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useRef, useState } from 'react';
import { Menu } from 'lucide-react'; // Import the Menu icon from lucide-react
import Button from '@/app/components/Button';

export default function Navbar() {
    const params = useParams(); // Get the dynamic slug
    const event = EVENTS.find(event => event.slug === params?.slug); // Find the event ID based on the slug
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

    if (!event) {
        notFound();
    }

    const navItems = EVENT_NAVS.find(nav => nav.eventId === event.id)?.items || [];

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className="text-navy-800 text-[24px] my-0 p-4">
            {/* Hamburger Icon for Mobile */}
            <div className="md:hidden flex items-center justify-between">
                <button onClick={toggleMobileMenu} className="focus:outline-none">
                    {/* Lucide Menu Icon */}
                    <Menu className=" text-navy-800" size={64} />
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <ul className="md:hidden flex flex-col bg-gray-700 pl-8 rounded-md shadow-lg absolute left-0 right-0 z-10 mx-4 text-[16px]">
                    {params?.slug && navItems.map((navItem, index) => (
                        <li key={index} className="text-white p-2 rounded-md font-gotham">
                            {navItem.subItems ? (
                                <>
                                    {navItem.path && (
                                        <Link
                                            href={`/events/${params.slug}/${navItem.path}`}
                                            className="block hover:bg-lightBlue-400 transition-colors duration-300 p-2 rounded-md"
                                        >
                                            {navItem.label}
                                        </Link>
                                    )}
                                    <ul className="mt-2 text-[14px]">
                                        {navItem.subItems.map(subItem => (
                                            <li key={subItem.path}>
                                                <Link
                                                    href={`/events/${params.slug}/about/${subItem.path}`}
                                                    className="block hover:bg-gray-600 transition-colors duration-300 rounded-md font-gotham  px-4 py-2 text-white"
                                                >
                                                    {subItem.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            ) : navItem.path ? ( // Only render Link if path exists
                                <Link
                                    href={`/events/${params.slug}/${navItem.path}`}
                                    className="block hover:bg-lightBlue-400 transition-colors duration-300 p-2 rounded-md"
                                >
                                    {navItem.label}
                                </Link>
                            ) : (
                                <span className="block p-2 text-gray-400">{navItem.label}</span> // Fallback text
                            )}
                        </li>
                    ))}
                    <span className="relative p-2 pl-0 pr-4 mr-4 flex grow">
                        <Button
                            title="REGISTER"
                            variant="btn_sqr_blue"
                            link={event.registerLink}
                        />
                    </span>
                </ul>
            )}

            {/* Desktop Menu */}
            <ul className="hidden lg:grid lg:grid-cols-10 relative items-center list-none md:flex md:flex-wrap md:justify-center">

                {/* Centered Nav Items */}
                <div className="col-span-2 flex justify-end">
                    <li className="relative p-2 hidden grow max-w-[440px]">
                        <Button
                            title="REGISTER"
                            variant="btn_sqr_blue"
                            link={event.registerLink}
                        />
                    </li>
                </div>
                <div className="col-span-6 flex items-center justify-center">
                    {params?.slug && navItems.map((navItem, index) => (
                        <li
                            key={index}
                            className="relative p-2 rounded-full"
                            onMouseEnter={() => handleMouseEnter(index)}
                            onMouseLeave={handleMouseLeave}
                        >
                            {navItem.subItems ? (
                                <>
                                    {navItem.path ? (
                                        <Link
                                            href={`/events/${params.slug}/${navItem.path}`}
                                            className="hover:bg-lightBlue-400 hover:text-white transition-colors duration-300 p-2 px-4 rounded-full"
                                        >
                                            {navItem.label}
                                        </Link>
                                    ) : (
                                        <span className="hover:bg-lightBlue-400 hover:text-white transition-colors duration-300 p-2 px-4 rounded-full text-navy-800">
                                            {navItem.label} {/* Fallback text for items without a path */}
                                        </span>
                                    )}
                                    {isDropdownOpen && dropdownIndex === index && (
                                        <ul className="mt-4 absolute left-1/2 -translate-x-1/2 bg-gray-700 rounded-md shadow-lg list-none whitespace-nowrap">
                                            {navItem.subItems.map(subItem => (
                                                <li key={subItem.path}>
                                                    <Link
                                                        href={`/events/${params.slug}/about/${subItem.path}`}
                                                        className="block hover:bg-gray-600 hover:text-white transition-colors duration-300 rounded-md px-12 py-4 text-white"
                                                    >
                                                        {subItem.label}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </>
                            ) : navItem.path ? ( // Only render Link if path exists
                                <Link
                                    href={`/events/${params.slug}/${navItem.path}`}
                                    className="hover:bg-lightBlue-400 hover:text-white transition-colors duration-300 p-2 px-4 rounded-full"
                                >
                                    {navItem.label}
                                </Link>
                            ) : (
                                <span className="hover:bg-lightBlue-400 hover:text-white transition-colors duration-300 p-2 px-4 rounded-full text-navy-800">
                                    {navItem.label}  {/* Fallback text for items without a path */}
                                </span>
                            )}
                        </li>
                    ))}
                </div>

                {/* Register Button Aligned Right */}
                {/* <div className="col-span-2 flex justify-end"> */}
                    <li className="relative p-2 flex grow max-w-[440px] mt-4 md:mt-0 lg:col-span-2 lg:justify-end md:flex-1">
                        <Button
                            title="REGISTER"
                            variant="btn_sqr_blue"
                            link={event.registerLink}
                        />
                    </li>
                {/* </div> */}
            </ul>
        </nav>
    );
}