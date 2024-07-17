import React from 'react';
import '@/assets/styles/globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthProvider from '@/components/authProvider';

export const metadata = {
  title: 'PropertyPulse | Find The Perfect Rental',
  description: 'Find your dream rental property.',
  keywords: 'rental, find rentals, property, rent, find properties',
};

const MainLayout = ({ children }) => {
  return (
    <AuthProvider>
      <html lang='en'>
        <body>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </body>
      </html>
    </AuthProvider>
  );
};

export default MainLayout;
