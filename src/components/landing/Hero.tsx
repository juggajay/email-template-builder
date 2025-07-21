'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ZebCharacter, StripeBackground } from '@/components/brand';
import { Play, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// A/B Testing variants
const variants = {
  A: {
    headline: "Email marketing that scales with your ambition",
    cta: "See Your Growth Path",
    ctaHref: "#demo",
  },
  B: {
    headline: "From $100K to $10M with systematic email marketing",
    cta: "Calculate Your Growth Potential",
    ctaHref: "#calculator",
  },
};

export function Hero() {
  const [variant, setVariant] = useState<'A' | 'B'>('A');
  const [zebVisible, setZebVisible] = useState(false);

  useEffect(() => {
    // Simple A/B test implementation - in production, use a proper A/B testing service
    const randomVariant = Math.random() > 0.5 ? 'A' : 'B';
    setVariant(randomVariant);

    // Delayed Zeb appearance for subtle effect
    const timer = setTimeout(() => setZebVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const currentVariant = variants[variant];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with animated stripe pattern */}
      <StripeBackground animation="parallax" speed="slow" opacity={0.08}>
        <div className="absolute inset-0 bg-gradient-to-br from-systematic-grey via-white to-growth-green/5" />
      </StripeBackground>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main headline with A/B variant */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-zebra-black mb-6 leading-tight">
            {currentVariant.headline}
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto">
            The systematic path to e-commerce growth with sophisticated automation made surprisingly simple
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href={currentVariant.ctaHref}>
              <Button
                size="lg"
                className="bg-growth-green hover:bg-growth-green-600 text-white px-8 py-6 text-lg font-semibold group"
              >
                {currentVariant.cta}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="#video">
              <Button
                size="lg"
                variant="outline"
                className="border-gray-300 hover:border-growth-green hover:text-growth-green px-8 py-6 text-lg font-semibold group"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch 2-min Demo
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zebra-black">2,847</span>
              <span>merchants growing</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-gray-300" />
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zebra-black">$127M</span>
              <span>revenue generated</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-gray-300" />
            <div className="flex items-center gap-2">
              <span className="font-semibold text-growth-green">34%</span>
              <span>average growth</span>
            </div>
          </div>
        </div>

        {/* Beta Test CTA */}
        <div className="relative mt-16 max-w-4xl mx-auto">
          <div className="relative rounded-xl overflow-hidden shadow-2xl border-2 border-growth-green bg-gradient-to-br from-growth-green/5 to-white p-12">
            {/* Stripe pattern overlay */}
            <div className="absolute inset-0 opacity-10">
              <StripeBackground animation="static" opacity={0.1} color="#00d4aa">
                <div className="absolute inset-0" />
              </StripeBackground>
            </div>
            
            <div className="relative z-10 text-center">
              {/* Urgency Badge */}
              <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                Beta Program 92% Full
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-zebra-black mb-4">
                Exclusive Beta Access - Limited Spots Remaining
              </h2>
              
              {/* Beta Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-3xl mx-auto">
                <div className="text-center">
                  <div className="text-2xl font-bold text-growth-green mb-1">2 Weeks</div>
                  <div className="text-sm text-gray-600">Free Full Access</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-growth-green mb-1">50% OFF</div>
                  <div className="text-sm text-gray-600">Lifetime Discount</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-growth-green mb-1">Direct Access</div>
                  <div className="text-sm text-gray-600">To Our Dev Team</div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full max-w-md mx-auto mb-6">
                <div className="flex justify-between text-xs text-gray-600 mb-2">
                  <span>8 spots remaining</span>
                  <span>92 beta testers</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-growth-green to-growth-green-600 h-full rounded-full transition-all duration-500" style={{width: '92%'}}></div>
                </div>
              </div>
              
              <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
                Join our exclusive beta program and help shape the future of e-commerce email marketing. 
                Get early access, lifetime benefits, and direct influence on our product roadmap.
              </p>
              
              {/* What We Expect */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8 max-w-2xl mx-auto text-left">
                <h3 className="font-semibold text-zebra-black mb-3">What We Expect From Beta Testers:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-growth-green mt-0.5">✓</span>
                    <span>Weekly feedback on features and user experience</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-growth-green mt-0.5">✓</span>
                    <span>Test email templates with your actual campaigns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-growth-green mt-0.5">✓</span>
                    <span>Share testimonials and success stories</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-growth-green mt-0.5">✓</span>
                    <span>Participate in our private Slack community</span>
                  </li>
                </ul>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="bg-growth-green hover:bg-growth-green-600 text-white px-8 py-6 text-lg font-semibold group shadow-lg"
                  >
                    Claim Your Beta Spot
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                
                <Link href="/beta">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-growth-green text-growth-green hover:bg-growth-green/10 px-8 py-6 text-lg font-semibold"
                  >
                    Learn More About Beta
                  </Button>
                </Link>
              </div>
              
              <p className="text-xs text-gray-500 mt-4">
                * Exclusive offers including future feature requests and priority support
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Zeb character peeking from corner */}
      <div
        className={cn(
          'fixed bottom-4 right-4 z-20 transition-all duration-1000',
          zebVisible
            ? 'translate-x-0 translate-y-0 opacity-100'
            : 'translate-x-32 translate-y-32 opacity-0'
        )}
      >
        <ZebCharacter variant="peek" size="lg" />
      </div>
    </section>
  );
}