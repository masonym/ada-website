import type { Metadata } from "next";
import "./globals.css";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react"
import ScrollToTop from "./components/ScrollToTop";

export const metadata: Metadata = {
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
        url: '/logo.png',
        width: 1200,
        height: 630,
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
        url: '/logo.png',
        alt: 'American Defense Alliance Logo',
      },
    ],
  },
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-300">
        <ScrollToTop/>
        <div className="bg-navy-800">
          <NavBar />
        </div>
        <main className="relative overflow-hidden ">
          {children}
        </main>
        <SpeedInsights />
        <Analytics />
        <Footer />
      </body>
    </html>
  );
}
