import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | ZebaMail - Email Template Builder for Shopify',
  description: 'Learn how ZebaMail protects your privacy and handles your data. Our commitment to security and transparency for Shopify merchants.',
  openGraph: {
    title: 'Privacy Policy | ZebaMail',
    description: 'Your privacy matters. Learn how we protect your data and respect your rights.',
    url: 'https://www.zebamail.com/privacy',
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}