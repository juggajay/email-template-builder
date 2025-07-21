'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { ShopifySettingsSimple } from '@/components/shopify/shopify-settings-simple';
import { 
  User, 
  Palette, 
  Shield, 
  Bell, 
  Key, 
  Link as LinkIcon,
  Save,
  Upload,
  Trash2
} from 'lucide-react';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  companyName: z.string().optional(),
});

const brandSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  accentColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type BrandFormData = z.infer<typeof brandSchema>;

export function SettingsContent() {
  const { user, profile, updateProfile, isPro, isAgency } = useAuth();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'profile' | 'brand' | 'security' | 'integrations' | 'notifications'>('profile');
  const [saving, setSaving] = useState(false);

  // Handle URL parameters
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['profile', 'brand', 'security', 'integrations', 'notifications'].includes(tab)) {
      setActiveTab(tab as any);
    }
  }, [searchParams]);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile?.full_name || '',
      email: profile?.email || '',
      companyName: profile?.company_name || '',
    },
  });

  const brandForm = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      primaryColor: (profile?.brand_colors as any)?.primary || '#3b82f6',
      secondaryColor: (profile?.brand_colors as any)?.secondary || '#64748b',
      accentColor: (profile?.brand_colors as any)?.accent || '#10b981',
    },
  });

  const handleProfileSubmit = async (data: ProfileFormData) => {
    setSaving(true);
    try {
      await updateProfile({
        full_name: data.fullName,
        email: data.email,
        company_name: data.companyName,
      });
      // Show success message
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleBrandSubmit = async (data: BrandFormData) => {
    setSaving(true);
    try {
      await updateProfile({
        brand_colors: {
          primary: data.primaryColor,
          secondary: data.secondaryColor,
          accent: data.accentColor,
        },
      });
      // Show success message
    } catch (error) {
      console.error('Error updating brand colors:', error);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'brand', name: 'Brand', icon: Palette },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'integrations', name: 'Integrations', icon: LinkIcon },
    { id: 'notifications', name: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab(tab.id as any)}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.name}
              </Button>
            );
          })}
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Profile Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar
                    src={profile?.logo_url}
                    alt={profile?.full_name || 'User'}
                    fallback={profile?.full_name || 'User'}
                    size="lg"
                  />
                  <div>
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photo
                    </Button>
                    <p className="text-sm text-gray-600 mt-1">
                      JPG, PNG up to 2MB
                    </p>
                  </div>
                </div>

                <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
                  <Input
                    {...profileForm.register('fullName')}
                    label="Full Name"
                    placeholder="John Doe"
                    error={profileForm.formState.errors.fullName?.message}
                  />

                  <Input
                    {...profileForm.register('email')}
                    label="Email"
                    type="email"
                    placeholder="john@example.com"
                    error={profileForm.formState.errors.email?.message}
                  />

                  <Input
                    {...profileForm.register('companyName')}
                    label="Company Name"
                    placeholder="Your Company"
                    error={profileForm.formState.errors.companyName?.message}
                  />

                  <Button type="submit" loading={saving} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'brand' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="w-5 h-5 mr-2" />
                  Brand Colors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-sm text-gray-600">
                  Customize your brand colors to match your company's identity. These colors will be used in your email templates.
                </div>

                <form onSubmit={brandForm.handleSubmit(handleBrandSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Color
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          {...brandForm.register('primaryColor')}
                          className="w-12 h-12 rounded border"
                        />
                        <Input
                          {...brandForm.register('primaryColor')}
                          placeholder="#3b82f6"
                          error={brandForm.formState.errors.primaryColor?.message}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Secondary Color
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          {...brandForm.register('secondaryColor')}
                          className="w-12 h-12 rounded border"
                        />
                        <Input
                          {...brandForm.register('secondaryColor')}
                          placeholder="#64748b"
                          error={brandForm.formState.errors.secondaryColor?.message}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Accent Color
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          {...brandForm.register('accentColor')}
                          className="w-12 h-12 rounded border"
                        />
                        <Input
                          {...brandForm.register('accentColor')}
                          placeholder="#10b981"
                          error={brandForm.formState.errors.accentColor?.message}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Preview</h4>
                    <div className="flex space-x-2">
                      <div 
                        className="w-16 h-16 rounded"
                        style={{ backgroundColor: brandForm.watch('primaryColor') }}
                      />
                      <div 
                        className="w-16 h-16 rounded"
                        style={{ backgroundColor: brandForm.watch('secondaryColor') }}
                      />
                      <div 
                        className="w-16 h-16 rounded"
                        style={{ backgroundColor: brandForm.watch('accentColor') }}
                      />
                    </div>
                  </div>

                  <Button type="submit" loading={saving} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Colors
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Password</h4>
                      <p className="text-sm text-gray-600">Change your password</p>
                    </div>
                    <Button variant="outline">
                      <Key className="w-4 h-4 mr-2" />
                      Change Password
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-600">Add an extra layer of security</p>
                    </div>
                    <Badge variant="outline">Not Enabled</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Active Sessions</h4>
                      <p className="text-sm text-gray-600">Manage your active sessions</p>
                    </div>
                    <Button variant="outline">View Sessions</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-6">
              {/* Shopify Integration */}
              <ShopifySettingsSimple />
              
              {/* Other Integrations */}
              <Card>
                <CardHeader>
                  <CardTitle>Other Integrations</CardTitle>
                  <p className="text-sm text-gray-600">More integrations coming soon</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-purple-600 font-bold">K</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Klaviyo</h4>
                        <p className="text-sm text-gray-600">Email marketing platform</p>
                      </div>
                    </div>
                    <Badge variant="outline">Coming Soon</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <span className="text-yellow-600 font-bold">M</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Mailchimp</h4>
                        <p className="text-sm text-gray-600">Email marketing platform</p>
                      </div>
                    </div>
                    <Badge variant="outline">Coming Soon</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-gray-600">Receive email updates</p>
                    </div>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Marketing Emails</h4>
                      <p className="text-sm text-gray-600">Product updates and tips</p>
                    </div>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Usage Alerts</h4>
                      <p className="text-sm text-gray-600">When you're close to limits</p>
                    </div>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Security Alerts</h4>
                      <p className="text-sm text-gray-600">Login and security notifications</p>
                    </div>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                </div>

                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}