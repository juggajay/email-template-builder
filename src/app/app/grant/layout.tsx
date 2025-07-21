import { ReactNode } from 'react';

export const metadata = {
  title: 'ZebaMail - Shopify Email Marketing',
};

// Allow this page to be embedded in Shopify admin
export const headers = {
  'X-Frame-Options': 'ALLOWALL',
  'Content-Security-Policy': "frame-ancestors https://admin.shopify.com https://*.myshopify.com;",
};

export default function ShopifyAppLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}