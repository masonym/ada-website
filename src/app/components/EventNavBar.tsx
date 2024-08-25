"use client";

import { EVENT_NAVS } from '@/constants/eventNavs';
import { EVENTS } from '@/constants/events';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useRef } from 'react';
import { useState } from 'react';

export default function Navbar() {
    const params = useParams(); // Get the dynamic slug
    const eventId = EVENTS.find(event => event.slug === params?.slug)?.id; // Find the event ID based on the slug
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [dropdownIndex, setDropdownIndex] = useState<number | null>(null);
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


    return (
        <nav className="text-navy-800 text-[24px] mt-4 p-4">
            <ul className="flex space-x-4 relative items-center justify-center list-none">
                {params?.slug && navItems.map((navItem, index) => (
                    <li
                        key={index}
                        className="relative hover:bg-lightBlue-400 hover:text-white p-2 px-4 rounded-full"
                        onMouseEnter={() => handleMouseEnter(index)}
                        onMouseLeave={handleMouseLeave}
                    >
                        {navItem.subItems ? (
                            <>
                                <span className="cursor-pointer">{navItem.label}</span>
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
