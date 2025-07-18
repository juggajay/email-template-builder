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
  FolderOpen
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Templates', href: '/templates', icon: FileText },
  { name: 'My Templates', href: '/my-templates', icon: FolderOpen },
  { name: 'Email Editor', href: '/editor', icon: Mail },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Billing', href: '/billing', icon: CreditCard },
  { name: 'Help', href: '/help', icon: HelpCircle },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, profile, subscription, signOut, isPro, isAgency } = useAuth();

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
            <span className="text-xl font-bold text-gray-900">Email Builder</span>
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
                  className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
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
            <span className="text-xl font-bold text-gray-900">Email Builder</span>
          </div>
          
          <nav className="flex-1 mt-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User menu */}
          <div className="flex-shrink-0 p-4 border-t">
            <div className="flex items-center space-x-3">
              <Avatar
                src={profile?.logo_url}
                alt={profile?.full_name || 'User'}
                fallback={profile?.full_name || 'User'}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {profile?.full_name || 'User'}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge
                    variant={isPro ? 'default' : isAgency ? 'secondary' : 'outline'}
                    className="text-xs"
                  >
                    {isAgency ? (
                      <>
                        <Crown className="w-3 h-3 mr-1" />
                        Agency
                      </>
                    ) : isPro ? (
                      <>
                        <Zap className="w-3 h-3 mr-1" />
                        Pro
                      </>
                    ) : (
                      'Free'
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
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 lg:px-6">
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
                <span className="text-sm text-gray-600">
                  {profile?.usage_count || 0}/5 exports this month
                </span>
                <Link href="/billing">
                  <Button variant="outline" size="sm">
                    Upgrade
                  </Button>
                </Link>
              </div>
            )}

            <Link href="/editor">
              <Button>
                <Mail className="w-4 h-4 mr-2" />
                New Template
              </Button>
            </Link>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}