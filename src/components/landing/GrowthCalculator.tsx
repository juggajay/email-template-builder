'use client';

import React, { useState, useEffect } from 'react';
import { GrowthMetric, ZebCharacter, StripePattern } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Calculator, TrendingUp, Info } from 'lucide-react';

const industries = [
  { value: 'fashion', label: 'Fashion & Apparel', avgRate: 0.28 },
  { value: 'beauty', label: 'Beauty & Cosmetics', avgRate: 0.32 },
  { value: 'food', label: 'Food & Beverage', avgRate: 0.25 },
  { value: 'electronics', label: 'Electronics', avgRate: 0.22 },
  { value: 'home', label: 'Home & Garden', avgRate: 0.26 },
  { value: 'sports', label: 'Sports & Outdoors', avgRate: 0.24 },
  { value: 'other', label: 'Other', avgRate: 0.25 },
];

const emailFrequencies = [
  { value: 'low', label: '1-2 per month', multiplier: 0.6 },
  { value: 'medium', label: '1-2 per week', multiplier: 1.0 },
  { value: 'high', label: '3-4 per week', multiplier: 1.3 },
  { value: 'daily', label: 'Daily', multiplier: 1.5 },
];

export function GrowthCalculator() {
  const [currentRevenue, setCurrentRevenue] = useState('');
  const [listSize, setListSize] = useState('');
  const [industry, setIndustry] = useState('');
  const [frequency, setFrequency] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState({
    currentEmailRevenue: 0,
    potentialEmailRevenue: 0,
    additionalRevenue: 0,
    growthPercentage: 0,
  });

  const calculateGrowth = () => {
    setIsCalculating(true);
    setShowResults(false);

    // Simulate calculation with Zeb thinking animation
    setTimeout(() => {
      const revenue = parseFloat(currentRevenue) || 0;
      const subscribers = parseFloat(listSize) || 0;
      const industryData = industries.find(i => i.value === industry) || industries[6];
      const frequencyData = emailFrequencies.find(f => f.value === frequency) || emailFrequencies[1];

      // Current email revenue (assuming 15% baseline)
      const currentEmailRevenue = revenue * 0.15;

      // Potential with ZebaMail optimization
      const optimizationFactor = 1.8; // 80% improvement on average
      const industryMultiplier = industryData.avgRate / 0.25; // Relative to average
      const frequencyMultiplier = frequencyData.multiplier;
      const sizeMultiplier = Math.min(subscribers / 10000, 2); // Cap at 2x for large lists

      const potentialEmailRevenue = currentEmailRevenue * optimizationFactor * industryMultiplier * frequencyMultiplier * Math.max(sizeMultiplier, 1);
      const additionalRevenue = potentialEmailRevenue - currentEmailRevenue;
      const growthPercentage = (additionalRevenue / revenue) * 100;

      setResults({
        currentEmailRevenue,
        potentialEmailRevenue,
        additionalRevenue,
        growthPercentage,
      });

      setIsCalculating(false);
      setShowResults(true);
    }, 2000);
  };

  const isFormValid = currentRevenue && listSize && industry && frequency;

  return (
    <section id="calculator" className="py-20 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-growth-green/10 text-growth-green px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Calculator className="w-4 h-4" />
              Growth Calculator
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-zebra-black mb-4">
              Calculate Your Growth Potential
            </h2>
            <p className="text-lg sm:text-xl text-gray-700">
              See how much additional revenue you could generate with ZebaMail's systematic approach
            </p>
          </div>

          {/* Calculator Form */}
          <div className="bg-systematic-grey rounded-2xl p-8 relative">
            <StripePattern animation="static" opacity={0.02} className="rounded-2xl" />
            
            <div className="relative z-10 grid md:grid-cols-2 gap-6">
              {/* Monthly Revenue */}
              <div>
                <Label htmlFor="revenue" className="text-sm font-medium text-gray-700">
                  Current Monthly Revenue
                </Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="revenue"
                    type="number"
                    placeholder="50000"
                    value={currentRevenue}
                    onChange={(e) => setCurrentRevenue(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Email List Size */}
              <div>
                <Label htmlFor="listSize" className="text-sm font-medium text-gray-700">
                  Email List Size
                </Label>
                <Input
                  id="listSize"
                  type="number"
                  placeholder="5000"
                  value={listSize}
                  onChange={(e) => setListSize(e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Industry */}
              <div>
                <Label htmlFor="industry" className="text-sm font-medium text-gray-700">
                  Industry
                </Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((ind) => (
                      <SelectItem key={ind.value} value={ind.value}>
                        {ind.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Email Frequency */}
              <div>
                <Label htmlFor="frequency" className="text-sm font-medium text-gray-700">
                  Current Email Frequency
                </Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="How often do you email?" />
                  </SelectTrigger>
                  <SelectContent>
                    {emailFrequencies.map((freq) => (
                      <SelectItem key={freq.value} value={freq.value}>
                        {freq.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Calculate Button */}
            <div className="mt-8 text-center">
              <Button
                size="lg"
                onClick={calculateGrowth}
                disabled={!isFormValid || isCalculating}
                className="bg-growth-green hover:bg-growth-green-600 text-white px-8"
              >
                {isCalculating ? 'Calculating...' : 'Calculate My Growth Potential'}
              </Button>
            </div>

            {/* Zeb Animation */}
            {isCalculating && (
              <div className="absolute inset-0 bg-white/90 rounded-2xl flex items-center justify-center z-20">
                <div className="text-center">
                  <ZebCharacter variant="thinking" size="lg" className="mx-auto mb-4" />
                  <p className="text-gray-600">Analyzing your growth potential...</p>
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          {showResults && (
            <div className={cn(
              'mt-8 bg-gradient-to-br from-growth-green/5 to-success-purple/5 rounded-2xl p-8 relative',
              'animate-in fade-in slide-in-from-bottom-4 duration-500'
            )}>
              <StripePattern animation="success" opacity={0.03} className="rounded-2xl" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <h3 className="text-2xl font-bold text-zebra-black">Your Growth Potential</h3>
                  <ZebCharacter variant="celebrate" size="md" />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">Additional Monthly Revenue</p>
                    <GrowthMetric
                      value={results.additionalRevenue}
                      format="currency"
                      size="lg"
                      trend="up"
                      showPoweredBy
                    />
                  </div>

                  <div className="bg-white rounded-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">Total Revenue Increase</p>
                    <GrowthMetric
                      value={results.growthPercentage}
                      format="percentage"
                      size="lg"
                      trend="up"
                      comparison={{
                        value: 15,
                        label: 'industry avg',
                        format: 'percentage'
                      }}
                    />
                  </div>
                </div>

                <div className="mt-6 p-4 bg-white/50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-growth-green mt-0.5" />
                    <div className="text-sm text-gray-700">
                      <p className="font-medium mb-1">How we calculated this:</p>
                      <p>Based on your industry's average email revenue rate, optimized segmentation, and ZebaMail's proven performance improvements across {2847} similar merchants.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <Button
                    size="lg"
                    className="bg-growth-green hover:bg-growth-green-600 text-white"
                  >
                    See How to Achieve This Growth
                    <TrendingUp className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}