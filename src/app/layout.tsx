import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';
import { AuthProvider } from '@/components/providers/auth-provider';
import { WebVitalsReporter } from '@/components/monitoring/web-vitals';
import GoogleAnalytics from '@/components/GoogleAnalytics';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Email Template Builder for Shopify | ZebaMail - Boost Sales 34%',
  description: 'Create stunning email templates that convert. Join 2,847 Shopify stores using ZebaMail to drive $127M in revenue. Free email builder, no credit card required.',
  keywords: 'shopify email templates, email template builder, abandoned cart email template, email builder, free email builder, ecommerce email marketing, shopify email designer',
  authors: [{ name: 'ZebaMail' }],
  metadataBase: new URL('https://www.zebamail.com'),
  openGraph: {
    title: 'ZebaMail - Email Templates That Sell | Free Email Builder',
    description: 'Professional email templates for Shopify stores. Create abandoned cart emails that recover 28.3% of lost sales. Free email template builder.',
    url: 'https://www.zebamail.com',
    siteName: 'ZebaMail',
    images: [
      {
        url: 'https://www.zebamail.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ZebaMail - Professional Email Templates for Shopify',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZebaMail - Email Templates That Sell',
    description: 'Professional email template builder for Shopify stores. Create emails that convert.',
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
  verification: {
    google: 'your-google-site-verification',
    yandex: 'your-yandex-verification',
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
        <GoogleAnalytics />
        <AuthProvider>
          <WebVitalsReporter />
          {children}
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}