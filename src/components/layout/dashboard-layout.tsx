'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Mail, 
  FileText, 
  Settings, 
  CreditCard, 
  HelpCircle, 
  LogOut, 
  Menu, 
  X,
  Zap,
  Crown,
  FolderOpen,
  MessageSquarePlus,
  Shield
} from 'lucide-react';
import { ZebCharacter, StripePattern } from '@/components/brand';
import { TargetIcon } from '@/components/brand/GeometricIcons';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const getNavigation = (isAdmin: boolean) => {
  const baseNav: Array<{ name: string; href: string; icon: any; badge?: string }> = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Templates', href: '/templates', icon: FileText },
    { name: 'Campaign Builder', href: '/editor', icon: Mail },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Billing', href: '/billing', icon: CreditCard },
    { name: 'Community', href: '/community', icon: MessageSquarePlus },
    { name: 'Help', href: '/help', icon: HelpCircle },
    { name: 'Privacy Policy', href: '/privacy', icon: Shield },
  ];


  return baseNav;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, profile, subscription, signOut, isPro, isAgency } = useAuth();
  
  const isAdmin = profile?.role === 'admin';
  const navigation = getNavigation(isAdmin);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
        
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-zebra-black">ZebaMail</span>
              <ZebCharacter variant="default" size="sm" className="w-6 h-6" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <nav className="mt-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative flex items-center px-4 py-3 text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-growth-green/10 text-growth-green border-r-2 border-growth-green'
                      : 'text-zebra-black hover:bg-gray-50 hover:text-growth-green'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {isActive && (
                    <div className="absolute inset-0 pointer-events-none">
                      <StripePattern animation="static" opacity={0.03} color="#00d4aa" />
                    </div>
                  )}
                  <Icon className="mr-3 h-5 w-5 relative z-10" />
                  <span className="relative z-10 flex items-center gap-2">
                    {item.name}
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-gray-200">
          <div className="flex items-center h-16 px-4 border-b">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-zebra-black">ZebaMail</span>
              <ZebCharacter variant="default" size="sm" className="w-6 h-6" />
            </div>
          </div>
          
          <nav className="flex-1 mt-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative flex items-center px-4 py-3 text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-growth-green/10 text-growth-green border-r-2 border-growth-green'
                      : 'text-zebra-black hover:bg-gray-50 hover:text-growth-green'
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 pointer-events-none">
                      <StripePattern animation="static" opacity={0.03} color="#00d4aa" />
                    </div>
                  )}
                  <Icon className="mr-3 h-5 w-5 relative z-10" />
                  <span className="relative z-10 flex items-center gap-2">
                    {item.name}
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* User menu */}
          <div className="flex-shrink-0 p-4 border-t">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar
                  src={profile?.logo_url}
                  alt={profile?.full_name || user?.email || 'User'}
                  fallback={profile?.full_name || user?.email || 'U'}
                  size="md"
                />
                <ZebCharacter variant="default" size="sm" className="absolute -bottom-1 -right-1 w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zebra-black truncate">
                  {profile?.full_name || user?.email || 'Loading...'}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge
                    variant={isPro ? 'default' : isAgency ? 'secondary' : 'outline'}
                    className="text-xs"
                  >
                    {isAgency ? (
                      <>
                        <Crown className="w-3 h-3 mr-1" />
                        Agency Plan
                      </>
                    ) : isPro ? (
                      <>
                        <Zap className="w-3 h-3 mr-1" />
                        Pro Plan
                      </>
                    ) : (
                      'Free Plan'
                    )}
                  </Badge>
                </div>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-3 justify-start"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col h-screen">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 lg:px-6 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center space-x-4">
            {/* Usage indicator for free users */}
            {!isPro && !isAgency && subscription && (
              <div className="hidden sm:flex items-center space-x-2">
                <span className="text-sm text-gray-700 font-medium">
                  <span className="text-growth-green">{profile?.usage_count || 0}</span>/5 campaigns this month
                </span>
                <Link href="/billing">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-growth-green text-growth-green hover:bg-growth-green hover:text-white"
                  >
                    Unlock Growth
                  </Button>
                </Link>
              </div>
            )}

            <Link href="/editor">
              <Button className="bg-growth-green hover:bg-growth-green-600 text-white">
                <TargetIcon className="w-4 h-4 mr-2" />
                Build Campaign
              </Button>
            </Link>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}