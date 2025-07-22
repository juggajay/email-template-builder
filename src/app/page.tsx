import { Header, Hero, SocialProof, Features, GrowthCalculator, Footer } from '@/components/landing';
import { Suspense } from 'react';
import { ShopifyRedirectHandler } from './page-shopify-redirect';
import Script from 'next/script';

const jsonLdSoftware = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "ZebaMail",
  "applicationCategory": "BusinessApplication",
  "applicationSubCategory": "Email Marketing Software",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "priceValidUntil": "2025-12-31"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "127",
    "bestRating": "5"
  },
  "description": "Professional email template builder for Shopify stores. Create abandoned cart emails that convert.",
  "url": "https://www.zebamail.com",
  "screenshot": "https://www.zebamail.com/screenshot.png",
  "featureList": [
    "Drag-and-drop email builder",
    "Shopify integration",
    "Abandoned cart recovery",
    "A/B testing",
    "Analytics dashboard",
    "Mobile responsive templates"
  ]
};

const jsonLdFAQ = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How many email templates can I create with ZebaMail?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Free plan includes 5 email exports per month with unlimited template creation. Pro plan offers unlimited exports and advanced features."
      }
    },
    {
      "@type": "Question",
      "name": "Does ZebaMail work with Shopify?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! ZebaMail is built specifically for Shopify stores. We integrate seamlessly with your Shopify data to create personalized email campaigns."
      }
    },
    {
      "@type": "Question",
      "name": "Can I create abandoned cart emails?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutely! Our abandoned cart email templates recover an average of 28.3% of lost sales. You can customize them with your brand and products."
      }
    },
    {
      "@type": "Question",
      "name": "Is there a free trial?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, we offer a free plan with 5 email exports per month. No credit card required to start building professional email templates."
      }
    }
  ]
};

export default function HomePage() {
  return (
    <>
      <Script
        id="json-ld-software"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSoftware) }}
      />
      <Script
        id="json-ld-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFAQ) }}
      />
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