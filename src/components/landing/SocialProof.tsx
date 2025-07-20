'use client';

import React from 'react';
import { GrowthMetric } from '@/components/brand';
import { Shield, Award, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

const metrics = [
  {
    label: 'Merchants Growing',
    value: 2847,
    format: 'number' as const,
  },
  {
    label: 'Revenue Generated',
    value: 127000000,
    format: 'currency' as const,
    suffix: ' last quarter',
  },
  {
    label: 'Average Revenue Increase',
    value: 34,
    format: 'percentage' as const,
    trend: 'up' as const,
  },
  {
    label: 'Emails Sent',
    value: 847000000,
    format: 'number' as const,
    suffix: '+',
  },
];

const trustBadges = [
  {
    icon: Shield,
    label: 'Shopify Partner',
  },
  {
    icon: Award,
    label: 'SOC2 Compliant',
  },
  {
    icon: Lock,
    label: 'GDPR Ready',
  },
];

export function SocialProof() {
  return (
    <section className="relative py-8 border-y border-gray-200 bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Scrolling Metrics */}
          <div className="relative flex-1 overflow-hidden">
            <div className="flex items-center gap-8 animate-scroll">
              {/* Duplicate metrics for seamless scroll */}
              {[...metrics, ...metrics].map((metric, index) => (
                <div
                  key={`${metric.label}-${index}`}
                  className="flex items-center gap-3 whitespace-nowrap"
                >
                  <GrowthMetric
                    value={metric.value}
                    format={metric.format}
                    suffix={metric.suffix}
                    trend={metric.trend}
                    size="sm"
                    duration={2000}
                    delay={index * 200}
                  />
                  <span className="text-sm text-gray-600">{metric.label}</span>
                  
                  {/* Divider */}
                  <div className="h-8 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent mx-4" />
                </div>
              ))}
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center gap-6 lg:border-l lg:pl-8 lg:ml-8 border-gray-200">
            {trustBadges.map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-2 group cursor-pointer"
              >
                <badge.icon className="w-5 h-5 text-growth-green transition-transform group-hover:scale-110" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-growth-green transition-colors">
                  {badge.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 30s linear infinite;
        }

        @media (max-width: 1024px) {
          .animate-scroll {
            animation-duration: 20s;
          }
        }
      `}</style>
    </section>
  );
}