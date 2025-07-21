'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ZebCharacter } from '@/components/brand';
import { Menu, X } from 'lucide-react';

const navigation = [
  { name: 'Features', href: '#features' },
  { name: 'Templates', href: '#templates' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Resources', href: '#resources' },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-200',
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm'
          : 'bg-transparent'
      )}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <ZebCharacter size="sm" variant="default" className="transition-transform group-hover:scale-110" />
            </div>
            <span className="text-xl font-bold text-zebra-black">ZebaMail</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-growth-green relative group',
                  pathname === item.href ? 'text-growth-green' : 'text-gray-700'
                )}
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-growth-green transition-all group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-700 hover:text-growth-green">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-growth-green hover:bg-growth-green-600 text-white">
                Start Growing
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-growth-green hover:bg-gray-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {isMobileMenuOpen ? (
              <X className="block h-6 w-6" />
            ) : (
              <Menu className="block h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={cn(
            'md:hidden absolute left-0 right-0 bg-white border-b border-gray-200 shadow-lg transition-all duration-200 ease-in-out',
            isMobileMenuOpen
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 -translate-y-full pointer-events-none'
          )}
        >
          <div className="px-4 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'block px-3 py-2 rounded-md text-base font-medium transition-colors',
                  pathname === item.href
                    ? 'text-growth-green bg-growth-green/10'
                    : 'text-gray-700 hover:text-growth-green hover:bg-gray-50'
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 pb-3 border-t border-gray-200">
              <Link
                href="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-growth-green hover:bg-gray-50 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="block mt-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Button className="w-full bg-growth-green hover:bg-growth-green-600 text-white">
                  Start Growing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <style jsx>{`
        @media (max-width: 768px) {
          nav {
            position: relative;
          }
        }
      `}</style>
    </header>
  );
}