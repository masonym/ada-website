import React from 'react';
import Link from 'next/link';
import { EVENTS } from '@/constants/events';

const HeroSection = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <svg
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1000 1000"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#001f3f" />
            <stop offset="100%" stopColor="#003366" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg-gradient)" />
        <g fill="#ffffff" opacity="0.1">
          {/* Stylized stars */}
          {[...Array(50)].map((_, i) => (
            <circle
              key={i}
              cx={Math.random() * 1000}
              cy={Math.random() * 1000}
              r={Math.random() * 3 + 1}
            />
          ))}
          {/* Stylized planes */}
          {[...Array(5)].map((_, i) => (
            <path
              key={i}
              d="M10 10 L30 20 L50 10 L30 15 Z"
              transform={`translate(${Math.random() * 900}, ${Math.random() * 900}) rotate(${Math.random() * 360})`}
            />
          ))}
          {/* Stylized satellites */}
          {[...Array(3)].map((_, i) => (
            <g key={i} transform={`translate(${Math.random() * 900}, ${Math.random() * 900}) rotate(${Math.random() * 360})`}>
              <rect x="0" y="0" width="30" height="10" />
              <rect x="10" y="-10" width="10" height="30" />
            </g>
          ))}
        </g>
      </svg>
      <div className="relative z-10 text-center text-white px-4 w-full max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 break-words">
          American Defense Alliance
        </h1>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 max-w-3xl mx-auto italic font-semibold">
          Connecting Industry to Government Procurement Opportunities
        </p>
        <Link 
          href={`/events/${EVENTS[0].slug}`} 
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition duration-300 text-sm sm:text-base md:text-lg"
        >
          Learn About Our Next Event
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;