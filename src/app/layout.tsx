import type { Metadata } from "next";
import "./globals.css";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import { GoogleAnalytics } from '@next/third-parties/google'
import StripeProvider from '@/components/StripeProvider';
import { getUpcomingEventLinks } from '@/lib/events';


export const metadata: Metadata = {
  metadataBase: new URL('https://americandefensealliance.org/'),
  alternates: {
    canonical: '/',
  },
  title: {
    default: 'American Defense Alliance',
    template: '%s',
  },
  description: 'Connecting industry leaders with U.S. defense opportunities. Access forecasts, events, and resources for government contractors and military suppliers.',

  // Open Graph metadata
  openGraph: {
    type: 'website',
    url: 'https://www.americandefensealliance.org/',
    title: 'American Defense Alliance',
    description: 'Connecting industry leaders with U.S. defense opportunities. Access forecasts, events, and resources for government contractors and military suppliers.',
    images: [
      {
        url: '/logo.webp',
        width: 625,
        height: 625,
        alt: 'American Defense Alliance Logo',
      },
    ],
    siteName: 'American Defense Alliance',
  },

  // Twitter Card metadata
  twitter: {
    card: 'summary_large_image',
    site: '@AmDefAlliance',
    title: 'American Defense Alliance',
    description: 'Connecting industry leaders with U.S. defense opportunities. Access forecasts, events, and resources for government contractors and military suppliers.',
    images: [
      {
        url: '/logo.webp',
        width: 625,
        height: 625,
        alt: 'American Defense Alliance Logo',
      },
    ],
  },

}

/**
 * Site-level structured data.
 *
 * This was previously a template string that was then passed through
 * JSON.stringify, which wraps a string in quotes and escapes its contents - so
 * the tag emitted a quoted JSON string rather than a JSON-LD object, and
 * parsers rejected it. It also sat inside a `next/head` element, which is a
 * no-op in the App Router, so it never rendered at all.
 */
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "American Defense Alliance",
  url: "https://www.americandefensealliance.org/",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Resolved here so the header does not have to import the events data.
  const upcomingEvents = getUpcomingEventLinks();

  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-300">
        {/*
          A plain <script>, not next/script: next/script injects after hydration,
          so the tag lands in the RSC payload rather than the served HTML and a
          crawler reading the raw response never sees it. This is what the Next
          docs recommend for JSON-LD.
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <StripeProvider>
          <ScrollToTop />
          <div className="bg-navy-800">
            <NavBar upcomingEvents={upcomingEvents} />
          </div>
          <main className="relative overflow-hidden">
            {children}
          </main>
          <Footer />
          <GoogleAnalytics gaId="G-166BFD7CN0" />
        </StripeProvider>
      </body>
    </html>
  );
}
