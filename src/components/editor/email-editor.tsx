'use client';

import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { copyHTMLToClipboard } from '@/lib/email/export';
import { Copy } from 'lucide-react';

interface EmailEditorProps {
  templateId?: string;
  initialDesign?: any;
  onSave?: (design: any, html: string) => void;
  onExport?: (html: string, design: any) => void;
}

// E-commerce specific custom blocks
const ecommerceBlocks = {
  'product-showcase': {
    name: 'Product Showcase',
    label: 'Product Card',
    media: '<svg>...</svg>',
    content: {
      type: 'product-showcase',
      attributes: {},
      innerBlocks: []
    }
  },
  'abandoned-cart': {
    name: 'Abandoned Cart',
    label: 'Cart Items',
    media: '<svg>...</svg>',
    content: {
      type: 'abandoned-cart',
      attributes: {},
      innerBlocks: []
    }
  }
};

export function EmailEditor({ templateId, initialDesign, onSave, onExport }: EmailEditorProps) {
  const editorRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadUnlayerScript();
  }, []);

  const loadUnlayerScript = () => {
    if ((window as any).unlayer) {
      initializeEditor();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://editor.unlayer.com/embed.js';
    script.onload = () => initializeEditor();
    document.body.appendChild(script);
  };

  const initializeEditor = () => {
    const unlayer = (window as any).unlayer;
    
    unlayer.init({
      id: 'editor-container',
      projectId: process.env.NEXT_PUBLIC_UNLAYER_PROJECT_ID,
      displayMode: 'email',
      appearance: {
        theme: 'modern_light',
        panels: {
          tools: {
            dock: 'left'
          }
        }
      },
      tools: {
        'custom#product-showcase': {
          name: 'Product Showcase',
          label: 'Product',
          icon: 'fa-shopping-bag',
          supportedDisplayModes: ['email'],
          options: {
            productImage: {
              title: 'Product Image',
              position: 1,
              options: {
                imageUrl: {
                  label: 'Image URL',
                  defaultValue: 'https://via.placeholder.com/300x300',
                  widget: 'text'
                }
              }
            },
            productName: {
              title: 'Product Name',
              position: 2,
              options: {
                text: {
                  label: 'Name',
                  defaultValue: 'Amazing Product',
                  widget: 'text'
                }
              }
            },
            productPrice: {
              title: 'Price',
              position: 3,
              options: {
                price: {
                  label: 'Price',
                  defaultValue: '$99.99',
                  widget: 'text'
                }
              }
            }
          },
          values: {},
          renderer: {
            Viewer: unlayer.createViewer({
              render(values: any) {
                return `
                  <div style="text-align: center; padding: 20px;">
                    <img src="${values.productImage.imageUrl}" alt="${values.productName.text}" style="max-width: 100%; height: auto;">
                    <h3>${values.productName.text}</h3>
                    <p style="font-size: 24px; color: #333;">${values.productPrice.price}</p>
                    <a href="#" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; display: inline-block;">Shop Now</a>
                  </div>
                `;
              }
            }),
            exporters: {
              email: function(values: any) {
                return `
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 20px;">
                        <img src="${values.productImage.imageUrl}" alt="${values.productName.text}" style="max-width: 300px; width: 100%; height: auto;">
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding: 10px;">
                        <h3 style="margin: 0;">${values.productName.text}</h3>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding: 10px;">
                        <p style="font-size: 24px; color: #333; margin: 0;">${values.productPrice.price}</p>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding: 20px;">
                        <a href="#" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; display: inline-block;">Shop Now</a>
                      </td>
                    </tr>
                  </table>
                `;
              }
            },
            head: {
              css: function(values: any) {
                return '';
              }
            }
          }
        }
      },
      mergeTags: {
        customer: {
          name: 'Customer',
          mergeTags: {
            first_name: {
              name: 'First Name',
              value: '{{customer.first_name}}'
            },
            email: {
              name: 'Email',
              value: '{{customer.email}}'
            }
          }
        },
        order: {
          name: 'Order',
          mergeTags: {
            order_number: {
              name: 'Order Number',
              value: '{{order.number}}'
            },
            total: {
              name: 'Total',
              value: '{{order.total}}'
            }
          }
        }
      }
    });

    unlayer.addEventListener('design:loaded', () => {
      setIsLoaded(true);
    });

    unlayer.addEventListener('design:updated', () => {
      // Auto-save functionality could go here
    });

    editorRef.current = unlayer;

    if (initialDesign) {
      unlayer.loadDesign(initialDesign);
    }
  };

  const handleSave = () => {
    const unlayer = editorRef.current;
    if (!unlayer) return;

    unlayer.saveDesign((design: any) => {
      unlayer.exportHtml((data: any) => {
        const { html } = data;
        if (onSave) {
          onSave(design, html);
        }
        toast.success('Template saved successfully!');
      });
    });
  };

  const handleExport = () => {
    const unlayer = editorRef.current;
    if (!unlayer) return;

    unlayer.exportHtml((data: any) => {
      const { design, html } = data;
      if (onExport) {
        onExport(html, design);
      }
    });
  };

  const handleCopyHTML = () => {
    const unlayer = editorRef.current;
    if (!unlayer) return;

    unlayer.exportHtml(async (data: any) => {
      const { html } = data;
      try {
        await copyHTMLToClipboard(html);
      } catch (error) {
        console.error('Failed to copy HTML:', error);
      }
    });
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="border-b p-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Email Template Editor</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave}>
            Save Template
          </Button>
          <Button onClick={handleCopyHTML}>
            <Copy className="w-4 h-4 mr-2" />
            Copy HTML
          </Button>
        </div>
      </div>
      <div id="editor-container" className="flex-1" />
    </div>
  );
}