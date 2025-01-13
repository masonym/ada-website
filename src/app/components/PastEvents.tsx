import React, { useMemo } from 'react';
import { EVENTS } from '@/constants/events';
import Image from 'next/image';
import Link from 'next/link';
import { History, ArrowRight } from 'lucide-react';
import { getCdnPath } from '@/utils/image';
import { validateImagePaths } from '@/utils/imageUtils';

const SimpleEventCard = async ({ title, date, image, slug }: {
    title: string;
    date: string;
    image: string;
    slug: string;
}) => {
    // Get the event from EVENTS array to access eventShorthand
    const event = EVENTS.find(e => e.slug === slug);
    if (!event?.eventShorthand) return null;
    
    const hasRecap = await validateImagePaths(event.eventShorthand);
    const linkPath = hasRecap ? `/events/${slug}/about/event-recap` : `/events/${slug}`;

    return (
        <Link href={linkPath} className="w-full group">
            <div className="relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-105 shadow-md">
                <div className="relative h-[250px] sm:h-[200px] w-full">
                    <Image
                        src={getCdnPath(image)}
                        fill
                        style={{ objectFit: 'cover' }}
                        alt={`Event image for ${title}`}
                        className="transition-transform duration-300 group-hover:scale-105"
                    />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-4 sm:p-4">
                    <h3 className="text-white font-bold text-lg sm:text-xl mb-2 line-clamp-2">{title}</h3>
                    <p className="text-white/90 text-sm">{date}</p>
                </div>

                <div className="absolute top-3 right-3 bg-gray-800/90 text-white px-2 py-1 text-xs sm:text-sm rounded-md">
                    Past Event
                </div>

                {/* Hover State - Hidden on mobile to prevent sticky hover states */}
                <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:flex items-center justify-center">
                    <div className="bg-white text-blue-600 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                        View Recap <ArrowRight className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </Link>
    );
};

const PastEvents = () => {
    const eventsByYear = useMemo(() => {
        const now = new Date();
        const pastEvents = EVENTS
            .filter(event => new Date(event.timeStart) < now)
            .reduce((acc, event) => {
                const year = new Date(event.timeStart).getFullYear();
                if (!acc[year]) {
                    acc[year] = [];
                }
                acc[year].push(event);
                return acc;
            }, {} as Record<number, typeof EVENTS>);

        return Object.entries(pastEvents)
            .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
            .map(([year, events]) => ({
                year: Number(year),
                events: events.sort((a, b) =>
                    new Date(b.timeStart).getTime() - new Date(a.timeStart).getTime()
                )
            }));
    }, []);

    if (eventsByYear.length === 0) {
        return null;
    }

    return (
        <section id="past-events" className="max-container flex flex-col items-center mt-8 mb-8 px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 sm:mb-8 text-center">
                <History className="w-12 h-12 sm:w-14 sm:h-14 text-gray-500" />
                <h2 className="font-gotham font-bold text-3xl sm:text-[36px] md:text-[64px] text-gray-700">
                    Past Events
                </h2>
            </div>
            
            <p className="text-center text-gray-600 text-base sm:text-xl mb-3 sm:mb-4 max-w-3xl mx-2">
                Explore Highlights from our Past Events
            </p>
            <p className="text-center text-gray-600 text-sm sm:text-xl mb-8 sm:mb-12 max-w-3xl mx-2">
                Access a Comprehensive Collection of Event Recaps consisting of Photo Galleries, Video Highlights, Testimonials, and Presentation Materials to relive Key Moments and Insights
            </p>

            <div className="w-full max-w-7xl">
                {eventsByYear.map(({ year, events }) => (
                    <div key={year} className="mb-12 sm:mb-16">
                        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8 px-2 sm:px-0">
                            <h3 className="text-2xl sm:text-3xl font-bold text-gray-700 whitespace-nowrap">
                                {year}
                            </h3>
                            <div className="flex-1 h-[1px] bg-gray-300"></div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {events.map(event => (
                                <SimpleEventCard
                                    key={event.id}
                                    title={event.title}
                                    date={event.date}
                                    image={event.image}
                                    slug={event.slug}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default PastEvents;