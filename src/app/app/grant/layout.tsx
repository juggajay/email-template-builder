import { ReactNode } from 'react';

export const metadata = {
  title: 'ZebaMail - Shopify Email Marketing',
};

export default function ShopifyAppLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}