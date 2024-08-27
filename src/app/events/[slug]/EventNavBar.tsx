"use client";

import { EVENT_NAVS } from '@/constants/eventNavs';
import { EVENTS } from '@/constants/events';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useRef, useState } from 'react';
import { Menu } from 'lucide-react';
import Button from '@/app/components/Button';

export default function Navbar() {
    const params = useParams();
    const event = EVENTS.find(event => event.slug === params?.slug);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [dropdownIndex, setDropdownIndex] = useState<number | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
        }, 200);
    };

    const handleLinkClick = () => {
        setIsDropdownOpen(false);
        setDropdownIndex(null);
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
            {/* <div className="md:hidden flex items-center justify-between">
                <button onClick={toggleMobileMenu} className="focus:outline-none">
                    <Menu className="text-navy-800" size={64} />
                </button>
            </div> */}

            {/* {isMobileMenuOpen && (
                <ul className="md:hidden flex flex-col bg-gray-700 pl-8 rounded-md shadow-lg absolute left-0 right-0 z-10 mx-4 text-[16px]">
                    {params?.slug && navItems.map((navItem, index) => (
                        <li key={index} className="text-white p-2 rounded-md font-gotham">
                            {navItem.subItems ? (
                                <>
                                    <span className="block p-2 text-white">{navItem.label}</span>
                                    <ul className="mt-2 text-[14px]">
                                        {navItem.subItems.map(subItem => (
                                            <li key={subItem.path}>
                                                <Link
                                                    href={`/events/${params.slug}/about/${subItem.path}`}
                                                    className="block hover:bg-gray-600 transition-colors duration-300 rounded-md font-gotham px-4 py-2 text-white"
                                                >
                                                    {subItem.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            ) : (
                                <Link
                                    href={`/events/${params.slug}/${navItem.path}`}
                                    className="block hover:bg-lightBlue-400 transition-colors duration-300 p-2 rounded-md"
                                >
                                    {navItem.label}
                                </Link>
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
            )} */}

            <ul className="flex-col md:flex-row flex relative items-center justify-center list-none">
                <div className="flex-col md:flex-row flex items-center">
                    <li className="relative p-2 flex grow" />
                    {params?.slug && navItems.map((navItem, index) => (
                        <li
                            key={index}
                            className="relative p-2 rounded-full"
                            onMouseEnter={() => handleMouseEnter(index)}
                            onMouseLeave={handleMouseLeave}
                        >
                            {navItem.subItems ? (
                                <>
                                    <span className="hover:bg-lightBlue-400 hover:text-white transition-colors duration-300 p-2 px-4 rounded-full cursor-pointer">
                                        {navItem.label}
                                    </span>
                                    {isDropdownOpen && dropdownIndex === index && (
                                        <ul className="mt-4 absolute left-1/2 -translate-x-1/2 bg-gray-700 rounded-md shadow-lg list-none whitespace-nowrap z-30">
                                            {navItem.subItems.map(subItem => (
                                                <li key={subItem.path}>
                                                    <Link
                                                        href={`/events/${params.slug}/about/${subItem.path}`}
                                                        className="block hover:bg-gray-600 hover:text-white transition-colors duration-300 rounded-md px-12 py-4 text-white"
                                                        onClick={handleLinkClick}
                                                    >
                                                        {subItem.label}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </>
                            ) : (
                                <Link
                                    href={`/events/${params.slug}/${navItem.path}`}
                                    className="hover:bg-lightBlue-400 hover:text-white transition-colors duration-300 p-2 px-4 rounded-full"
                                    onClick={handleLinkClick}
                                >
                                    {navItem.label}
                                </Link>
                            )}
                        </li>
                    ))}
                    <li className="relative p-2 flex grow" />
                </div>

                <div className="flex justify-end">
                    <li className="relative p-2 flex grow max-w-[840px]">
                        <Button
                            title="REGISTER"
                            variant="btn_sqr_blue"
                            link={event.registerLink}
                        />
                    </li>
                </div>
            </ul>
        </nav>
    );
}