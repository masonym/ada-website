import type { Metadata } from "next";
import "./globals.css";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";


export const metadata: Metadata = {
  title: "American Defense Alliance",
  description: "Industry, Resource, Marketplace", // change this
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-300">
        <div className="bg-lightBlue-400">
        <NavBar />
        </div>
        <main className="relative overflow-hidden ">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
