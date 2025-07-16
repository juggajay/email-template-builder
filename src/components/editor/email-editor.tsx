'use client';

import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { 
  Save, 
  Download, 
  Eye, 
  Smartphone, 
  Monitor, 
  Tablet,
  Settings,
  Palette,
  Type,
  Image,
  Square,
  ShoppingCart,
  Clock,
  Percent,
  Star
} from 'lucide-react';

interface EmailEditorProps {
  templateId?: string;
  initialDesign?: any;
  onSave?: (design: any, html: string) => void;
  onExport?: (html: string) => void;
}

// E-commerce specific tools configuration
const ecommerceTools = {
  'product-card': {
    name: 'Product Card',
    icon: 'fa-shopping-bag',
    properties: {
      productName: { editor: 'text', value: 'Product Name' },
      productPrice: { editor: 'text', value: '$99.99' },
      productImage: { editor: 'image', value: 'https://via.placeholder.com/300x200' },
      buttonText: { editor: 'text', value: 'Shop Now' },
      buttonLink: { editor: 'text', value: '#' },
      backgroundColor: { editor: 'color', value: '#ffffff' },
      textColor: { editor: 'color', value: '#333333' },
      priceColor: { editor: 'color', value: '#e74c3c' },
    },
    renderer: {
      render: (values: any) => `
        <div style="background-color: ${values.backgroundColor}; padding: 20px; border-radius: 8px; text-align: center; margin: 10px 0;">
          <img src="${values.productImage}" alt="${values.productName}" style="width: 100%; max-width: 300px; height: auto; border-radius: 4px;">
          <h3 style="color: ${values.textColor}; margin: 15px 0 10px;">${values.productName}</h3>
          <p style="color: ${values.priceColor}; font-size: 18px; font-weight: bold; margin: 10px 0;">${values.productPrice}</p>
          <a href="${values.buttonLink}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 15px;">${values.buttonText}</a>
        </div>
      `
    }
  },
  'countdown-timer': {
    name: 'Countdown Timer',
    icon: 'fa-clock',
    properties: {
      title: { editor: 'text', value: 'Limited Time Offer!' },
      endDate: { editor: 'text', value: '2024-12-31' },
      backgroundColor: { editor: 'color', value: '#f8f9fa' },
      textColor: { editor: 'color', value: '#333333' },
      timerColor: { editor: 'color', value: '#e74c3c' },
    },
    renderer: {
      render: (values: any) => `
        <div style="background-color: ${values.backgroundColor}; padding: 20px; text-align: center; margin: 10px 0;">
          <h3 style="color: ${values.textColor}; margin-bottom: 15px;">${values.title}</h3>
          <div style="display: flex; justify-content: center; gap: 10px;">
            <div style="background-color: ${values.timerColor}; color: white; padding: 10px; border-radius: 4px; min-width: 50px;">
              <div style="font-size: 24px; font-weight: bold;">00</div>
              <div style="font-size: 12px;">DAYS</div>
            </div>
            <div style="background-color: ${values.timerColor}; color: white; padding: 10px; border-radius: 4px; min-width: 50px;">
              <div style="font-size: 24px; font-weight: bold;">00</div>
              <div style="font-size: 12px;">HOURS</div>
            </div>
            <div style="background-color: ${values.timerColor}; color: white; padding: 10px; border-radius: 4px; min-width: 50px;">
              <div style="font-size: 24px; font-weight: bold;">00</div>
              <div style="font-size: 12px;">MINS</div>
            </div>
            <div style="background-color: ${values.timerColor}; color: white; padding: 10px; border-radius: 4px; min-width: 50px;">
              <div style="font-size: 24px; font-weight: bold;">00</div>
              <div style="font-size: 12px;">SECS</div>
            </div>
          </div>
        </div>
      `
    }
  },
  'discount-code': {
    name: 'Discount Code',
    icon: 'fa-percentage',
    properties: {
      code: { editor: 'text', value: 'SAVE20' },
      description: { editor: 'text', value: 'Get 20% off your order' },
      backgroundColor: { editor: 'color', value: '#28a745' },
      textColor: { editor: 'color', value: '#ffffff' },
    },
    renderer: {
      render: (values: any) => `
        <div style="background-color: ${values.backgroundColor}; color: ${values.textColor}; padding: 20px; text-align: center; margin: 10px 0; border-radius: 8px;">
          <h3 style="margin: 0 0 10px;">${values.description}</h3>
          <div style="font-size: 24px; font-weight: bold; letter-spacing: 2px; border: 2px dashed ${values.textColor}; padding: 10px; display: inline-block; margin: 10px 0;">
            ${values.code}
          </div>
          <p style="margin: 10px 0 0; font-size: 14px; opacity: 0.9;">Copy this code at checkout</p>
        </div>
      `
    }
  }
};

export function EmailEditor({ templateId, initialDesign, onSave, onExport }: EmailEditorProps) {
  const editorRef = useRef<any>(null);
  const [editorLoaded, setEditorLoaded] = useState(false);
  const [templateName, setTemplateName] = useState('Untitled Template');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile' | 'tablet'>('desktop');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user, canExport } = useAuth();

  useEffect(() => {
    // Load Unlayer script
    const script = document.createElement('script');
    script.src = 'https://editor.unlayer.com/embed.js';
    script.onload = () => {
      initializeEditor();
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const initializeEditor = () => {
    if (typeof window !== 'undefined' && (window as any).unlayer) {
      const unlayer = (window as any).unlayer;
      
      unlayer.init({
        id: 'email-editor',
        projectId: process.env.NEXT_PUBLIC_UNLAYER_PROJECT_ID,
        displayMode: 'email',
        appearance: {
          theme: 'light',
          panels: {
            tools: {
              dock: 'left'
            },
            properties: {
              dock: 'right'
            }
          }
        },
        tools: {
          'custom#product-card': ecommerceTools['product-card'],
          'custom#countdown-timer': ecommerceTools['countdown-timer'],
          'custom#discount-code': ecommerceTools['discount-code'],
        },
        mergeTags: {
          customer: {
            name: 'Customer',
            mergeTags: {
              first_name: {
                name: 'First Name',
                value: '{{customer.first_name}}',
                sample: 'John'
              },
              last_name: {
                name: 'Last Name', 
                value: '{{customer.last_name}}',
                sample: 'Doe'
              },
              email: {
                name: 'Email',
                value: '{{customer.email}}',
                sample: 'john@example.com'
              }
            }
          },
          product: {
            name: 'Product',
            mergeTags: {
              name: {
                name: 'Product Name',
                value: '{{product.name}}',
                sample: 'Amazing Product'
              },
              price: {
                name: 'Price',
                value: '{{product.price}}',
                sample: '$99.99'
              },
              image: {
                name: 'Image',
                value: '{{product.image}}',
                sample: 'https://via.placeholder.com/300x200'
              }
            }
          }
        }
      });

      unlayer.addEventListener('editor:ready', () => {
        setEditorLoaded(true);
        if (initialDesign) {
          unlayer.loadDesign(initialDesign);
        }
      });

      editorRef.current = unlayer;
    }
  };

  const handleSave = async () => {
    if (!editorRef.current) return;

    setIsSaving(true);
    try {
      editorRef.current.saveDesign((design: any) => {
        editorRef.current.exportHtml((data: any) => {
          const { html } = data;
          if (onSave) {
            onSave(design, html);
          }
          setIsSaving(false);
        });
      });
    } catch (error) {
      console.error('Error saving template:', error);
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    if (!editorRef.current) return;

    const canUserExport = await canExport();
    if (!canUserExport) {
      alert('You have reached your export limit for this month. Please upgrade to continue.');
      return;
    }

    setIsLoading(true);
    try {
      editorRef.current.exportHtml((data: any) => {
        const { html } = data;
        if (onExport) {
          onExport(html);
        }
        setIsLoading(false);
      });
    } catch (error) {
      console.error('Error exporting template:', error);
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    if (!editorRef.current) return;

    editorRef.current.exportHtml((data: any) => {
      const { html } = data;
      const previewWindow = window.open('', '_blank');
      if (previewWindow) {
        previewWindow.document.write(html);
        previewWindow.document.close();
      }
    });
  };

  const getPreviewWidth = () => {
    switch (previewMode) {
      case 'mobile':
        return '375px';
      case 'tablet':
        return '768px';
      default:
        return '100%';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="font-medium"
              placeholder="Template name"
            />
            <Badge variant="outline">
              {previewMode === 'desktop' && <Monitor className="w-3 h-3 mr-1" />}
              {previewMode === 'mobile' && <Smartphone className="w-3 h-3 mr-1" />}
              {previewMode === 'tablet' && <Tablet className="w-3 h-3 mr-1" />}
              {previewMode}
            </Badge>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center border rounded-lg">
              <Button
                variant={previewMode === 'desktop' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPreviewMode('desktop')}
              >
                <Monitor className="w-4 h-4" />
              </Button>
              <Button
                variant={previewMode === 'tablet' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPreviewMode('tablet')}
              >
                <Tablet className="w-4 h-4" />
              </Button>
              <Button
                variant={previewMode === 'mobile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPreviewMode('mobile')}
              >
                <Smartphone className="w-4 h-4" />
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handlePreview}
              disabled={!editorLoaded}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              loading={isSaving}
              disabled={!editorLoaded || isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>

            <Button
              size="sm"
              onClick={handleExport}
              loading={isLoading}
              disabled={!editorLoaded || isLoading}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* E-commerce tools sidebar */}
      <div className="flex">
        <div className="w-64 bg-white border-r border-gray-200 p-4">
          <h3 className="font-medium text-gray-900 mb-4">E-commerce Tools</h3>
          <div className="space-y-2">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center mb-2">
                <ShoppingCart className="w-4 h-4 mr-2 text-blue-600" />
                <span className="text-sm font-medium">Product Card</span>
              </div>
              <p className="text-xs text-gray-600">Showcase products with image, price, and CTA</p>
            </div>

            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center mb-2">
                <Clock className="w-4 h-4 mr-2 text-red-600" />
                <span className="text-sm font-medium">Countdown Timer</span>
              </div>
              <p className="text-xs text-gray-600">Create urgency with dynamic timers</p>
            </div>

            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center mb-2">
                <Percent className="w-4 h-4 mr-2 text-green-600" />
                <span className="text-sm font-medium">Discount Code</span>
              </div>
              <p className="text-xs text-gray-600">Highlight promotional codes</p>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Palette className="w-4 h-4 mr-2" />
                Brand Colors
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Type className="w-4 h-4 mr-2" />
                Typography
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Image className="w-4 h-4 mr-2" />
                Images
              </Button>
            </div>
          </div>
        </div>

        {/* Editor container */}
        <div className="flex-1 bg-gray-100 p-4">
          <div 
            className="mx-auto bg-white shadow-lg rounded-lg overflow-hidden"
            style={{ width: getPreviewWidth(), minHeight: '600px' }}
          >
            <div id="email-editor" style={{ height: '600px' }} />
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {!editorLoaded && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6">
            <CardContent className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading email editor...</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}