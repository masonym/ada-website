import Link from 'next/link';
import Image from 'next/image';
import { getCdnPath } from '@/utils/image';

export const metadata = {
  title: 'Page Not Found | American Defense Alliance',
  description:
    "The page you're looking for couldn't be found. Explore upcoming events, past conferences, and resources from the American Defense Alliance.",
};

const QUICK_LINKS = [
  { href: '/events', label: 'Upcoming Events' },
  { href: '/events/past-events', label: 'Past Events' },
  { href: '/about', label: 'About Us' },
  { href: '/contact-us', label: 'Contact Us' },
];

export default function NotFound() {
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden">
      {/* Background image with navy gradient overlay — matches the homepage hero */}
      <div className="absolute inset-0">
        <Image
          src={getCdnPath('ADA_collage.webp')}
          alt=""
          fill
          priority
          aria-hidden="true"
          className="object-cover object-center"
          sizes="100vw"
          quality={80}
        />
        <div
          className="absolute inset-0 bg-gradient-to-br from-navy-800/95 via-navy-800/90 to-navy-800/80"
          aria-hidden="true"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-3xl px-4 py-20 text-center text-white">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-sb-100">
          Error 404
        </p>

        <h1 className="mb-4 text-6xl font-bold sm:text-7xl md:text-8xl">404</h1>

        <p className="mx-auto mb-4 max-w-xl text-xl font-semibold sm:text-2xl">
          This page is off course.
        </p>
        <p className="mx-auto mb-10 max-w-xl text-base text-gray-10 sm:text-lg">
          The page you&apos;re looking for may have been moved, renamed, or is no
          longer available. Let&apos;s get you back on mission.
        </p>

        {/* Primary actions */}
        <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/"
            className="inline-block rounded-full bg-blue-600 px-8 py-3 text-sm font-medium text-white transition duration-300 hover:bg-blue-700 sm:text-base"
          >
            Return Home
          </Link>
          <Link
            href="/events"
            className="inline-block rounded-full border border-white/30 bg-white px-8 py-3 text-sm font-medium text-navy-800 transition duration-300 hover:bg-gray-10 sm:text-base"
          >
            View Upcoming Events
          </Link>
        </div>

        {/* Quick navigation */}
        <div className="border-t border-white/15 pt-8">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-20">
            Or head to
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-10 underline-offset-4 transition duration-300 hover:text-sb-100 hover:underline sm:text-base"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}
