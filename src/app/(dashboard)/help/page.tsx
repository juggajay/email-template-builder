'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search,
  BookOpen,
  Zap,
  Mail,
  ShoppingBag,
  CreditCard,
  Users,
  Settings,
  HelpCircle,
  ExternalLink,
  MessageCircle,
  Youtube,
  FileText,
  Code,
  Sparkles
} from 'lucide-react';
import { ZebCharacter, StripePattern } from '@/components/brand';
import Link from 'next/link';

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = React.useState('');

  const helpSections = [
    {
      title: 'Getting Started',
      icon: BookOpen,
      description: 'New to ZebaMail? Start here',
      topics: [
        'Quick Start Guide',
        'Account Setup',
        'First Email Campaign',
        'Connecting Your Store'
      ],
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Email Editor',
      icon: Mail,
      description: 'Master our powerful visual editor',
      topics: [
        'Drag & Drop Basics',
        'Mobile Responsive Design',
        'Custom HTML/CSS',
        'Preview & Testing'
      ],
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Advanced Merge Tags',
      icon: Code,
      description: 'Personalization & dynamic content',
      topics: [
        '48+ Pre-built Tags',
        'Conditional Logic',
        'Fallback Values',
        'Shopify Integration'
      ],
      color: 'text-growth-green',
      bgColor: 'bg-growth-green/10',
      featured: true
    },
    {
      title: 'Template Library',
      icon: FileText,
      description: 'Browse and customize templates',
      topics: [
        'Template Categories',
        'Performance Metrics',
        'Customization',
        'Saving Templates'
      ],
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Integrations',
      icon: ShoppingBag,
      description: 'Connect your tools',
      topics: [
        'Shopify Setup',
        'Klaviyo Export',
        'Mailchimp Integration',
        'API Access'
      ],
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Billing & Plans',
      icon: CreditCard,
      description: 'Manage your subscription',
      topics: [
        'Plan Comparison',
        'Usage Tracking',
        'Upgrading',
        'Invoices & Receipts'
      ],
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    }
  ];

  const resources = [
    {
      title: 'Video Tutorials',
      icon: Youtube,
      description: 'Step-by-step video guides',
      link: '#',
      external: true
    },
    {
      title: 'API Documentation',
      icon: Code,
      description: 'For developers',
      link: '#',
      external: true
    },
    {
      title: 'Best Practices',
      icon: Sparkles,
      description: 'Email marketing tips',
      link: '#'
    },
    {
      title: 'Status Page',
      icon: Zap,
      description: 'System uptime & issues',
      link: '#',
      external: true
    }
  ];

  const filteredSections = helpSections.filter(section => 
    searchQuery === '' ||
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-growth-green/10 to-white p-8 border border-growth-green/20">
        <div className="absolute inset-0 opacity-5">
          <StripePattern animation="static" opacity={0.1} color="#00d4aa" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-zebra-black mb-2">
                How can we help you today?
              </h1>
              <p className="text-gray-600">
                Get answers and learn how to grow your business with ZebaMail
              </p>
            </div>
            <ZebCharacter variant="guide" size="lg" />
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search for help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg"
            />
          </div>
        </div>
      </div>

      {/* Help Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSections.map((section) => {
          const Icon = section.icon;
          return (
            <Card 
              key={section.title}
              className={`hover:shadow-lg transition-all duration-200 cursor-pointer group ${
                section.featured ? 'ring-2 ring-growth-green' : ''
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg ${section.bgColor} mb-4`}>
                    <Icon className={`h-6 w-6 ${section.color}`} />
                  </div>
                  {section.featured && (
                    <Badge variant="secondary" className="bg-growth-green/10 text-growth-green">
                      Featured
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl group-hover:text-growth-green transition-colors">
                  {section.title}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {section.description}
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {section.topics.map((topic) => (
                    <li key={topic} className="flex items-center text-sm text-gray-700">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2" />
                      {topic}
                    </li>
                  ))}
                </ul>
                <Button 
                  variant="ghost" 
                  className="w-full mt-4 group-hover:bg-growth-green/10 group-hover:text-growth-green"
                >
                  View Articles
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Resources */}
      <div>
        <h2 className="text-2xl font-bold text-zebra-black mb-4">
          Quick Resources
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {resources.map((resource) => {
            const Icon = resource.icon;
            return (
              <Link 
                key={resource.title}
                href={resource.link}
                className="group"
              >
                <Card className="hover:shadow-md transition-all duration-200 h-full hover:border-growth-green/50">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-growth-green/10">
                        <Icon className="h-5 w-5 text-gray-700 group-hover:text-growth-green" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-zebra-black group-hover:text-growth-green transition-colors flex items-center">
                          {resource.title}
                          {resource.external && (
                            <ExternalLink className="h-3 w-3 ml-1" />
                          )}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {resource.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Contact Support */}
      <Card className="bg-gradient-to-r from-growth-green/5 to-growth-green/10 border-growth-green/20">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-zebra-black mb-2">
                Still need help?
              </h2>
              <p className="text-gray-700 mb-4">
                Our support team is here to help you succeed
              </p>
              <div className="flex flex-wrap gap-4">
                <Button className="bg-growth-green hover:bg-growth-green-600 text-white">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Start Live Chat
                </Button>
                <Button variant="outline" className="border-growth-green text-growth-green hover:bg-growth-green/10">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Support
                </Button>
              </div>
            </div>
            <ZebCharacter variant="celebrate" size="md" className="hidden lg:block" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}