# Unlayer React Email Editor - Comprehensive Overview

## Table of Contents
1. [Introduction](#introduction)
2. [React Integration](#react-integration)
3. [Custom Tools and Components](#custom-tools-and-components)
4. [Export Options](#export-options)
5. [Theming and Customization](#theming-and-customization)
6. [E-commerce Features](#e-commerce-features)
7. [Pricing and Licensing](#pricing-and-licensing)
8. [Implementation Examples](#implementation-examples)

## Introduction

Unlayer is a drag-and-drop email editor that provides content builders for emails, pages, documents, and popups. It offers comprehensive React integration and extensive customization options.

### Key Features
- Visual drag-and-drop builder
- Multiple content types (Email, Page, Document, Popup)
- Framework integrations (React, Angular, Vue)
- Custom tools and blocks
- White-labeling capabilities
- Export to HTML and JSON

## React Integration

### Installation

```bash
# Using npm
npm install react-email-editor --save

# Using yarn
yarn add react-email-editor
```

### Basic Setup

```typescript
import React, { useRef } from 'react';
import EmailEditor, { EditorRef, EmailEditorProps } from 'react-email-editor';

const App = () => {
  const emailEditorRef = useRef<EditorRef>(null);

  const exportHtml = () => {
    const unlayer = emailEditorRef.current?.editor;
    unlayer?.exportHtml((data) => {
      const { design, html } = data;
      console.log('Exported HTML', html);
    });
  };

  const onReady: EmailEditorProps['onReady'] = (unlayer) => {
    // Editor is ready
    // You can load a design here
    // unlayer.loadDesign(templateJson);
  };

  return (
    <div>
      <button onClick={exportHtml}>Export HTML</button>
      <EmailEditor ref={emailEditorRef} onReady={onReady} />
    </div>
  );
};
```

### Key Props and Configuration

```typescript
interface EmailEditorProps {
  style?: React.CSSProperties;
  minHeight?: string | number;
  onLoad?: (unlayer: any) => void;
  onReady?: (unlayer: any) => void;
  options?: {
    // Unlayer configuration options
  };
  tools?: {
    // Tool configuration
  };
  appearance?: {
    // Theme and styling options
  };
}
```

### Available Methods

- `loadDesign(data)`: Load a design JSON into the editor
- `saveDesign(callback)`: Save the current design as JSON
- `exportHtml(callback)`: Export the design as HTML and JSON
- `addEventListener(type, callback)`: Listen to editor events
- `setMergeTags(mergeTags)`: Set merge tags for personalization

## Custom Tools and Components

### Creating Custom Tools

Custom tools allow you to extend the editor's functionality with your own components.

#### Key Attributes
1. **Name**: Unique identifier for the tool
2. **Label**: Display name in the editor
3. **Icon**: Choose from 700+ icons or use custom image
4. **Display Modes**: Support for email, web, or both
5. **Usage Limit**: Control how many times a tool can be used

#### Tool Structure

```javascript
const customTool = {
  name: 'my_custom_tool',
  label: 'My Custom Tool',
  icon: 'fa-star',
  supportedDisplayModes: ['email', 'web'],
  
  // Renderer defines the tool's content
  renderer: {
    // Viewer: What's shown in the editor
    viewer: `<div>{{content}}</div>`,
    
    // Exporters: HTML for different modes
    exporters: {
      email: `<div style="...">{{content}}</div>`,
      web: `<div class="...">{{content}}</div>`
    },
    
    // Head: CSS/JS assets
    head: {
      css: `<style>.my-tool { ... }</style>`,
      js: `<script>...</script>`
    }
  },
  
  // Properties: User-configurable options
  properties: {
    content: {
      editor: 'text_input',
      default: 'Default text'
    }
  }
};
```

### Property Editors

Unlayer provides various property editors:
- Text input
- Color picker
- Slider
- Toggle
- Dropdown
- Image selector
- And more...

## Export Options

### HTML Export

```javascript
const exportHtml = () => {
  const unlayer = emailEditorRef.current?.editor;
  
  unlayer?.exportHtml((data) => {
    const { design, html } = data;
    
    // design: JSON representation of the design
    // html: Rendered HTML output
    
    // Save or send the HTML
    console.log('HTML:', html);
    console.log('Design JSON:', design);
  });
};
```

### JSON Export

```javascript
const saveDesign = () => {
  const unlayer = emailEditorRef.current?.editor;
  
  unlayer?.saveDesign((design) => {
    console.log('Design JSON:', design);
    
    // Store the design for later use
    localStorage.setItem('emailDesign', JSON.stringify(design));
  });
};
```

### Loading a Design

```javascript
const loadDesign = () => {
  const unlayer = emailEditorRef.current?.editor;
  
  const design = JSON.parse(localStorage.getItem('emailDesign') || '{}');
  unlayer?.loadDesign(design);
};
```

## Theming and Customization

### Available Themes
- Four out-of-the-box themes
- Light and dark mode support
- Custom theme object support

### Customization Options

```javascript
const editorOptions = {
  appearance: {
    theme: 'dark', // 'light', 'dark', or custom theme object
    panels: {
      tools: {
        dock: 'left' // 'left' or 'right'
      }
    }
  },
  
  // Custom CSS
  customCSS: [
    '.my-custom-class { color: #000; }'
  ],
  
  // Custom JavaScript
  customJS: [
    'console.log("Custom JS loaded");'
  ]
};
```

### Custom Theme Object

```javascript
const customTheme = {
  name: 'my-theme',
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8',
    light: '#f8f9fa',
    dark: '#343a40'
  },
  fonts: {
    primary: 'Arial, sans-serif',
    secondary: 'Georgia, serif'
  }
};
```

### Layout Configuration
- Tool panel positioning
- Custom loading spinners
- Responsive design modes

## E-commerce Features

While Unlayer doesn't provide built-in e-commerce tools, you can create custom tools for:

### Custom E-commerce Tools Ideas

1. **Product Block**
```javascript
const productTool = {
  name: 'product_block',
  label: 'Product',
  icon: 'fa-shopping-cart',
  renderer: {
    viewer: `
      <div class="product-block">
        <img src="{{image}}" alt="{{name}}" />
        <h3>{{name}}</h3>
        <p>{{price}}</p>
        <a href="{{link}}">Shop Now</a>
      </div>
    `
  },
  properties: {
    name: { editor: 'text_input' },
    price: { editor: 'text_input' },
    image: { editor: 'image_picker' },
    link: { editor: 'url_input' }
  }
};
```

2. **Dynamic Product Grid**
3. **Shopping Cart Summary**
4. **Promotional Banners**
5. **Coupon Blocks**

## Pricing and Licensing

### Plans Overview

| Plan | Price | Key Features |
|------|-------|--------------|
| **Free** | $0/forever | Basic features, all builders |
| **Launch** | From $250/mo | White-label, custom tools, fonts, storage |
| **Scale** | From $750/mo | Custom blocks, AI writing, collaboration |
| **Optimize** | From $2000/mo | Custom themes, CSS, AMP, inbox previews |
| **Enterprise** | Custom | On-premise, dedicated support, style guide |

### Key Features by Plan

#### Free Plan
- Email, Page, Popup, Document builders
- Basic features
- Community support

#### Launch Plan ($250/mo)
- White-labeling
- Font management
- Custom storage
- Custom tools
- Localization
- Image editor
- Mobile design mode
- Cloud API
- Premium tools

#### Scale Plan ($750/mo)
- Everything in Launch
- Custom blocks
- AI-assisted writing
- Audit tab
- Team collaboration
- Built-in themes
- Custom image library
- Smart merge tags

#### Optimize Plan ($2000/mo)
- Everything in Scale
- Custom themes
- Custom CSS
- Custom tabs
- AMP support
- Inbox previews
- Synced blocks

#### Enterprise Plan (Custom)
- Brand style guide
- Custom OpenAI connector
- Multi-language templates
- Dedicated customer success manager
- Security & continuity
- On-premise/offline options

### Trial Period
- 14-day free trial for all paid plans
- No credit card required

## Implementation Examples

### Complete React Implementation

```typescript
import React, { useRef, useState } from 'react';
import EmailEditor, { EditorRef, EmailEditorProps } from 'react-email-editor';

interface EmailTemplate {
  id: string;
  name: string;
  design: any;
}

const EmailEditorComponent: React.FC = () => {
  const emailEditorRef = useRef<EditorRef>(null);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);

  const onReady: EmailEditorProps['onReady'] = (unlayer) => {
    // Register custom tools
    unlayer.registerTool({
      name: 'custom_button',
      label: 'Custom Button',
      icon: 'fa-hand-pointer',
      supportedDisplayModes: ['email', 'web'],
      options: {
        default: {
          text: 'Click me!'
        }
      },
      values: {},
      renderer: {
        Viewer: `<button>{{text}}</button>`,
        exporters: {
          email: `<table><tr><td><a href="{{link}}">{{text}}</a></td></tr></table>`,
          web: `<button onclick="window.open('{{link}}')">{{text}}</button>`
        }
      }
    });

    // Load saved template if exists
    const savedDesign = localStorage.getItem('currentDesign');
    if (savedDesign) {
      unlayer.loadDesign(JSON.parse(savedDesign));
    }
  };

  const saveTemplate = () => {
    const unlayer = emailEditorRef.current?.editor;
    
    unlayer?.saveDesign((design) => {
      const template: EmailTemplate = {
        id: Date.now().toString(),
        name: `Template ${templates.length + 1}`,
        design
      };
      
      setTemplates([...templates, template]);
      localStorage.setItem('templates', JSON.stringify([...templates, template]));
    });
  };

  const loadTemplate = (template: EmailTemplate) => {
    const unlayer = emailEditorRef.current?.editor;
    unlayer?.loadDesign(template.design);
  };

  const exportEmail = () => {
    const unlayer = emailEditorRef.current?.editor;
    
    unlayer?.exportHtml((data) => {
      const { html } = data;
      
      // Send email via API
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html })
      });
    });
  };

  const editorOptions = {
    displayMode: 'email',
    appearance: {
      theme: 'modern_light',
      panels: {
        tools: {
          dock: 'left'
        }
      }
    },
    features: {
      userUploads: true,
      stockImages: true,
      textEditor: {
        tables: true,
        emojis: true
      }
    },
    tools: {
      button: {
        properties: {
          backgroundColor: {
            value: '#007bff'
          }
        }
      }
    },
    mergeTags: {
      first_name: {
        name: 'First Name',
        value: '{{first_name}}'
      },
      last_name: {
        name: 'Last Name',
        value: '{{last_name}}'
      }
    }
  };

  return (
    <div className="email-editor-container">
      <div className="toolbar">
        <button onClick={saveTemplate}>Save Template</button>
        <button onClick={exportEmail}>Export & Send</button>
        
        <select onChange={(e) => {
          const template = templates.find(t => t.id === e.target.value);
          if (template) loadTemplate(template);
        }}>
          <option value="">Load Template...</option>
          {templates.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>
      
      <EmailEditor
        ref={emailEditorRef}
        onReady={onReady}
        options={editorOptions}
        minHeight="800px"
      />
    </div>
  );
};

export default EmailEditorComponent;
```

### Custom Tool for E-commerce Product

```javascript
const productBlockTool = {
  name: 'ecommerce_product',
  label: 'Product Block',
  icon: 'fa-tag',
  supportedDisplayModes: ['email', 'web'],
  options: {
    productName: {
      title: 'Product Name',
      position: 1,
      options: {
        default: 'Amazing Product'
      }
    },
    productPrice: {
      title: 'Price',
      position: 2,
      options: {
        default: '$99.99'
      }
    },
    productImage: {
      title: 'Product Image',
      position: 3,
      options: {
        default: {
          url: 'https://via.placeholder.com/300x300'
        }
      }
    },
    buttonText: {
      title: 'Button Text',
      position: 4,
      options: {
        default: 'Shop Now'
      }
    },
    buttonLink: {
      title: 'Button Link',
      position: 5,
      options: {
        default: 'https://example.com/product'
      }
    }
  },
  values: {},
  renderer: {
    Viewer: `
      <div class="product-block">
        <img src="{{productImage.url}}" alt="{{productName}}" style="width: 100%; max-width: 300px;" />
        <h2>{{productName}}</h2>
        <p class="price">{{productPrice}}</p>
        <a href="{{buttonLink}}" class="button">{{buttonText}}</a>
      </div>
    `,
    exporters: {
      email: `
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center">
              <img src="{{productImage.url}}" alt="{{productName}}" style="width: 100%; max-width: 300px;" />
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 20px;">
              <h2 style="margin: 0;">{{productName}}</h2>
              <p style="font-size: 24px; color: #e74c3c; margin: 10px 0;">{{productPrice}}</p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td bgcolor="#007bff" style="padding: 12px 30px; border-radius: 4px;">
                    <a href="{{buttonLink}}" style="color: #ffffff; text-decoration: none; font-weight: bold;">{{buttonText}}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `,
      web: `
        <div class="product-block" style="text-align: center; padding: 20px;">
          <img src="{{productImage.url}}" alt="{{productName}}" style="width: 100%; max-width: 300px;" />
          <h2>{{productName}}</h2>
          <p class="price" style="font-size: 24px; color: #e74c3c;">{{productPrice}}</p>
          <a href="{{buttonLink}}" class="button" style="display: inline-block; padding: 12px 30px; background: #007bff; color: white; text-decoration: none; border-radius: 4px;">{{buttonText}}</a>
        </div>
      `
    }
  }
};
```

## Best Practices

1. **Performance**
   - Lazy load the editor component
   - Use debouncing for auto-save functionality
   - Optimize custom tool assets

2. **User Experience**
   - Provide template library
   - Implement undo/redo functionality
   - Add preview modes (desktop/mobile)

3. **Integration**
   - Store designs in database as JSON
   - Implement version control for templates
   - Add collaboration features for team use

4. **Security**
   - Sanitize HTML output before sending emails
   - Validate merge tags and dynamic content
   - Implement proper authentication for template access

## Resources

- [Official Documentation](https://docs.unlayer.com/docs)
- [React Email Editor GitHub](https://github.com/unlayer/react-email-editor)
- [Unlayer GitHub Organization](https://github.com/unlayer)
- [Pricing Page](https://unlayer.com/pricing)

## Conclusion

Unlayer provides a powerful and flexible email editor solution with excellent React integration. While it doesn't include built-in e-commerce tools, its custom tool system allows developers to create any specialized components needed for their use case. The pricing model scales well from free tier to enterprise, making it suitable for projects of all sizes.

Key advantages:
- Easy React integration
- Extensive customization options
- Flexible export formats (HTML/JSON)
- White-labeling capabilities
- Active development and support

Considerations:
- E-commerce features require custom development
- Higher-tier features may be necessary for advanced use cases
- Pricing can be significant for smaller teams needing advanced features