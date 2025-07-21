'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ZebCharacter, StripePattern } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  Mail, 
  Twitter, 
  Linkedin, 
  Github,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const footerLinks = {
  product: [
    { name: 'Features', href: '#features' },
    { name: 'Integrations', href: '#integrations' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Roadmap', href: '#roadmap' },
  ],
  resources: [
    { name: 'Blog', href: '#blog' },
    { name: 'Growth Playbooks', href: '#playbooks' },
    { name: 'API Documentation', href: '#api' },
    { name: 'System Status', href: '#status' },
  ],
  company: [
    { name: 'About', href: '#about' },
    { name: 'Careers', href: '#careers' },
    { name: 'Partners', href: '#partners' },
    { name: 'Contact', href: '#contact' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '#privacy' },
    { name: 'Terms of Service', href: '#terms' },
    { name: 'GDPR', href: '#gdpr' },
    { name: 'Security', href: '#security' },
  ],
};

const socialLinks = [
  { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/zebamail' },
  { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/zebamail' },
  { name: 'GitHub', icon: Github, href: 'https://github.com/zebamail' },
];

export function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubscribing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubscribing(false);
      setIsSubscribed(true);
      toast.success('Welcome to the herd! Check your email for confirmation.');
      
      // Reset after animation
      setTimeout(() => {
        setEmail('');
        setIsSubscribed(false);
      }, 3000);
    }, 1500);
  };

  return (
    <footer className="bg-zebra-black text-white relative">
      {/* Stripe pattern divider */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-growth-green via-success-purple to-growth-green" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        {/* Newsletter Section */}
        <div className="mb-12 text-center relative">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-2">Join the Herd: Weekly growth insights</h3>
            <p className="text-gray-400 mb-6">
              Get the playbook that helped 2,847 merchants scale their email revenue
            </p>
            
            <form onSubmit={handleSubscribe} className="relative max-w-md mx-auto">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:bg-white/20"
                  disabled={isSubscribing || isSubscribed}
                />
                <Button
                  type="submit"
                  disabled={isSubscribing || isSubscribed || !email}
                  className="bg-growth-green hover:bg-growth-green-600 text-white"
                >
                  {isSubscribing ? (
                    'Subscribing...'
                  ) : isSubscribed ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Subscribed!
                    </>
                  ) : (
                    <>
                      Subscribe
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
              
              {/* Success animation */}
              {isSubscribed && (
                <div className="absolute -top-16 right-0">
                  <ZebCharacter variant="welcome" size="md" />
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
              Product
            </h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-growth-green transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
              Resources
            </h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-growth-green transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
              Company
            </h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-growth-green transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
              Legal
            </h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-growth-green transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Logo & Tagline */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <ZebCharacter size="sm" variant="default" />
                <span className="text-xl font-bold">ZebaMail</span>
              </Link>
              <span className="text-gray-400 text-sm hidden md:inline">
                Systematically growing since 2024
              </span>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-growth-green transition-colors"
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} ZebaMail. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}