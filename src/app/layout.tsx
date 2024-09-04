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
  description: 'American Defense Alliance: Connecting industry leaders with U.S. defense opportunities. Access forecasts, events, and resources for government contractors and military suppliers.',
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
