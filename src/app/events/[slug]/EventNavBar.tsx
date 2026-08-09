"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import { Event } from "@/types/events";
import { eventPageUrl, navGroupPath } from "@/lib/event-nav-path";
import Button from "@/app/components/Button";
import RegistrationModal from "@/components/RegistrationModal";

type NavItem = {
    label: string;
    path?: string;
    subItems?: Array<{ label: string; path: string }>;
};

/**
 * Per-event navigation.
 *
 * The event and its nav items are resolved on the server in the layout and
 * passed in. This used to import EVENTS and EVENT_NAVS and search them by
 * useParams().slug, which put every event's data in the browser bundle of every
 * event sub-page.
 */
export default function EventNavBar({ event, navItems }: { event: Event; navItems: NavItem[] }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [dropdownIndex, setDropdownIndex] = useState<number | null>(null);

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Registration modal state
    const [isModalOpen, setIsModalOpen] = useState(false);



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



    return (
        <nav className="z-40 py-3">
            <div className="mx-auto px-2 sm:px-4 lg:px-8">
                {/* Main Navigation - Always Visible */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-center lg:gap-4">
                    {/* Navigation Items */}
                    <div className="flex flex-wrap items-start justify-center lg:justify-start gap-2 py-2 lg:py-0">
                        {navItems.map((navItem, index) => (
                            <div
                                key={index}
                                className="relative"
                                onMouseEnter={() => handleMouseEnter(index)}
                                onMouseLeave={handleMouseLeave}
                            >
                                {navItem.subItems ? (
                                    <>
                                        <button className="relative flex items-center px-3 sm:px-4 py-2 text-sm sm:text-xl font-semibold text-navy-800 bg-white border border-navy-200 rounded-lg shadow-sm hover:shadow-md hover:border-lightBlue-400 transition-all duration-200 whitespace-nowrap group overflow-hidden">
                                            <span className="relative z-10 hidden sm:inline group-hover:text-white transition-colors duration-300">{navItem.label}</span>
                                            <span className="relative z-10 sm:hidden group-hover:text-white transition-colors duration-300">{navItem.label.split(' ')[0]}</span>
                                            <ChevronDown className="relative z-10 ml-2 h-4 w-4 group-hover:text-white transition-colors duration-300" />
                                            <span className="absolute inset-0 bg-lightBlue-400 transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100 rounded-lg"></span>
                                        </button>
                                        {isDropdownOpen && dropdownIndex === index && (
                                            <div className="absolute top-full left-0 mt-2 w-48 sm:w-60 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                                                <div className="py-2">
                                                    {navItem.subItems.map((subItem) => (
                                                        <Link
                                                            key={subItem.path}
                                                            href={eventPageUrl(event.slug, `${navGroupPath(navItem.label)}/${subItem.path}`)}
                                                            className="relative block px-4 py-3 text-sm text-gray-700 hover:bg-lightBlue-50 hover:text-lightBlue-700 hover:font-medium transition-all duration-200 border-l-4 border-transparent hover:border-lightBlue-400 group overflow-hidden"
                                                            onClick={handleLinkClick}
                                                        >
                                                            <span className="relative z-10 group-hover:text-lightBlue-700 transition-colors duration-300">{subItem.label}</span>
                                                            <span className="absolute inset-0 bg-lightBlue-50 transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <Link
                                        href={eventPageUrl(event.slug, navItem.path)}
                                        className="relative inline-block px-3 sm:px-4 py-2 text-sm sm:text-xl font-semibold text-navy-800 bg-white border border-navy-200 rounded-lg shadow-sm hover:shadow-md hover:border-lightBlue-400 transition-all duration-200 whitespace-nowrap group overflow-hidden"
                                        onClick={handleLinkClick}
                                    >
                                        <span className="relative z-10 hidden sm:inline group-hover:text-white transition-colors duration-300">{navItem.label}</span>
                                        <span className="relative z-10 sm:hidden group-hover:text-white transition-colors duration-300">{navItem.label}</span>
                                        <span className="absolute inset-0 bg-lightBlue-400 transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100 rounded-lg"></span>
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Register Button */}
                    <div className="flex justify-center lg:justify-end py-2 lg:py-0">
                        <Button
                            title="REGISTER"
                            variant="btn_sqr_blue"
                            onClick={() => setIsModalOpen(true)}
                        />
                    </div>
                </div>
            </div>

            {/* Registration Modal */}
            {isModalOpen && (
                <RegistrationModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    selectedRegistration={null}
                    event={{
                        ...event,
                        contactInfo: event.contactInfo || { contactEmail: "" }
                    }}
                />
            )}
        </nav>
    );
}
