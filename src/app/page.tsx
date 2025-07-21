import { Header, Hero, SocialProof, Features, GrowthCalculator, Footer } from '@/components/landing';
import { Suspense } from 'react';
import { ShopifyRedirectHandler } from './page-shopify-redirect';

export default function HomePage() {
  return (
    <>
      <Suspense fallback={null}>
        <ShopifyRedirectHandler />
      </Suspense>
      <Header />
      <main className="min-h-screen">
        <Hero />
        <SocialProof />
        <Features />
        <GrowthCalculator />
      </main>
      <Footer />
    </>
  );
}