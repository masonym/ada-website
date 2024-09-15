import { FC, ReactNode } from 'react';

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout: FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="en">
<<<<<<< Updated upstream
      <body>{children}</body>
=======
      <body className="min-h-screen">
        <ScrollToTop/>
        <div className="bg-navy-800">
          <NavBar />
        </div>
        <main className="relative overflow-hidden ">
          {children}
        </main>
        <GoogleAnalytics gaId="G-166BFD7CN0" />
        <SpeedInsights />
        <Footer />
      </body>
>>>>>>> Stashed changes
    </html>
  );
};

export default RootLayout;