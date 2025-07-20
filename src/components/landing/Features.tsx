'use client';

import React from 'react';
import { SystematicGrid, GridItem, StripePattern } from '@/components/brand';
import { 
  TargetIcon,
  DollarSignIcon,
  CartIcon,
  TrendingUpIcon,
  RefreshIcon,
  ChartIcon
} from '@/components/brand/GeometricIcons';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: TargetIcon,
    title: 'Smart Segmentation',
    description: 'Target customers who actually buy',
    metric: '3x higher conversion',
    color: 'text-growth-green',
  },
  {
    icon: DollarSignIcon,
    title: 'Revenue Attribution',
    description: 'Track every dollar from every email',
    metric: 'Real-time tracking',
    color: 'text-success-purple',
  },
  {
    icon: CartIcon,
    title: 'Abandoned Cart AI',
    description: 'Recover 23% more lost sales',
    metric: '23% recovery rate',
    color: 'text-alert-amber',
  },
  {
    icon: TrendingUpIcon,
    title: 'Growth Automation',
    description: 'Scale campaigns as you grow',
    metric: 'Auto-scaling',
    color: 'text-growth-green',
  },
  {
    icon: RefreshIcon,
    title: 'One-Click Migration',
    description: 'Switch from any platform in minutes',
    metric: '15 min setup',
    color: 'text-trust-blue',
  },
  {
    icon: ChartIcon,
    title: 'Live Analytics',
    description: 'See what drives real revenue',
    metric: 'Real-time insights',
    color: 'text-success-purple',
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 bg-systematic-grey relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-zebra-black mb-4">
            Everything you need to grow systematically
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto">
            Sophisticated features that work together to drive predictable revenue growth
          </p>
        </div>

        {/* Features Grid */}
        <SystematicGrid columns={3} gap="lg" animate>
          {features.map((feature, index) => (
            <GridItem key={feature.title}>
              <FeatureCard feature={feature} index={index} />
            </GridItem>
          ))}
        </SystematicGrid>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-gray-700 mb-4">
            Plus advanced features like A/B testing, dynamic content, and API access
          </p>
          <a
            href="#demo"
            className="inline-flex items-center text-growth-green hover:text-growth-green-600 font-medium group"
          >
            See all features
            <Sparkles className="ml-2 w-4 h-4 transition-transform group-hover:rotate-12" />
          </a>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const Icon = feature.icon;
  
  return (
    <div className="group relative h-full">
      {/* Card */}
      <div className="relative h-full p-8 bg-white rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-growth-green/20 overflow-hidden">
        {/* Stripe pattern on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <StripePattern 
            animation="static" 
            opacity={0.06} 
            color={
              feature.color === 'text-growth-green' ? '#00d4aa' :
              feature.color === 'text-success-purple' ? '#6b5fd4' :
              feature.color === 'text-alert-amber' ? '#ffb800' :
              '#0066ff'
            } 
          />
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Icon */}
          <div className={cn(
            'inline-flex p-3 rounded-lg mb-4 transition-all duration-300',
            'bg-gray-100 group-hover:bg-growth-green/10',
            feature.color
          )}>
            <Icon className="w-6 h-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-zebra-black mb-2">
            {feature.title}
          </h3>

          {/* Description */}
          <p className="text-gray-700 mb-4">
            {feature.description}
          </p>

          {/* Metric */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-growth-green animate-pulse" />
            <span className="text-sm font-medium text-growth-green">
              {feature.metric}
            </span>
          </div>
        </div>

        {/* Geometric accent */}
        <div 
          className="absolute -bottom-2 -right-2 w-16 h-16 transform rotate-45 bg-gradient-to-br from-growth-green/5 to-growth-green/10 transition-all duration-300 group-hover:scale-150"
          style={{ 
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
          }}
        />
      </div>
    </div>
  );
}