import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ZebaMail - Email Marketing That Scales With Your Ambition',
  description: 'The systematic path to e-commerce growth with sophisticated email automation made surprisingly simple. Join 2,847 merchants growing from $100K to $10M.',
  keywords: 'email marketing, e-commerce, Shopify email, automated campaigns, revenue attribution',
  authors: [{ name: 'ZebaMail' }],
  openGraph: {
    title: 'ZebaMail - Email Marketing That Scales With Your Ambition',
    description: 'The systematic path to e-commerce growth. Join 2,847 merchants scaling their revenue.',
    url: 'https://www.zebamail.com',
    siteName: 'ZebaMail',
    images: [
      {
        url: 'https://www.zebamail.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ZebaMail - Systematic Email Marketing Growth',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZebaMail - Email Marketing That Scales',
    description: 'The systematic path from $100K to $10M with email marketing',
    images: ['https://www.zebamail.com/twitter-image.png'],
    creator: '@zebamail',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}