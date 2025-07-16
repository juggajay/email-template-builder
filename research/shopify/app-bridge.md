# Shopify App Bridge

## Overview
Shopify App Bridge is a library that enables developers to create embedded apps with seamless integration into the Shopify admin. It provides a consistent interface between your app and the Shopify platform.

## Key Features

### UI Components
App Bridge provides React-like wrappers that communicate with the Shopify admin:
- Navigation menus
- Contextual save bars
- Title bars with actions
- Modal dialogs
- Toast notifications
- Loading states

**Important**: App Bridge components don't render as part of the app's component hierarchy - they render in the Shopify admin chrome.

### Rendering Environment
- **Web**: Apps render in an iframe
- **Mobile**: Apps render in a WebView
- Designed for performance, flexibility, and seamless integration

## Architecture

### Component Model
- Built on web components and JavaScript APIs
- React-like wrapper components
- Communication layer with Shopify admin
- Event-driven architecture

### Integration Approach
1. **Use with Polaris React** for consistent UI
2. **Leverage web components** for custom functionality
3. **Follow App Design Guidelines** for best practices

## Key Capabilities

### Navigation
- Create custom navigation menus
- Handle route changes
- Manage browser history
- Deep linking support

### Actions
- **Title Bar Actions**: Primary and secondary actions
- **Contextual Save Bar**: For form submissions
- **Modal Actions**: Confirmation dialogs
- **Toast Messages**: User feedback

### Data Management
- Session management
- Authentication handling
- State synchronization
- Resource picker integration

## Implementation for Email Template Builder

### Relevant Features
1. **Resource Picker**: Select products/collections for email templates
2. **Modal Dialogs**: Preview email templates
3. **Save Bar**: Save template changes
4. **Navigation**: Multi-step template creation
5. **Toast Notifications**: Success/error messages

### Example Integration
```javascript
import {Provider, TitleBar, Modal} from '@shopify/app-bridge-react';

function EmailTemplateEditor() {
  return (
    <Provider>
      <TitleBar
        title="Email Template Editor"
        primaryAction={{
          content: 'Save Template',
          onAction: saveTemplate,
        }}
        secondaryActions={[
          {
            content: 'Preview',
            onAction: openPreview,
          }
        ]}
      />
      {/* App content */}
    </Provider>
  );
}
```

## Best Practices

### Performance
- Minimize bridge communication
- Batch actions when possible
- Use optimistic UI updates
- Handle loading states properly

### User Experience
- Maintain Shopify admin consistency
- Use familiar patterns
- Provide clear feedback
- Handle errors gracefully

### Security
- Validate all bridge messages
- Use session tokens
- Implement proper CORS handling
- Secure iframe communication

## Mobile Considerations
- Test in Shopify mobile app
- Handle touch interactions
- Optimize for smaller screens
- Consider offline capabilities

## Common Patterns

### Form Handling
```javascript
// Contextual save bar for forms
const saveBar = {
  disabled: false,
  onSave: async () => {
    // Save logic
  },
  onDiscard: () => {
    // Discard changes
  }
};
```

### Navigation
```javascript
// App navigation
const navigate = useNavigate();
navigate('/templates/edit/123');
```

### Feedback
```javascript
// Toast notifications
const {show} = useToast();
show('Template saved successfully');
```

## Limitations
- Restricted to Shopify admin context
- Limited customization of chrome elements
- Must follow Shopify design patterns
- Performance overhead of iframe/bridge communication

## Development Tips
1. Use Shopify CLI for setup
2. Test in multiple browsers
3. Monitor console for bridge errors
4. Use App Bridge debug mode
5. Profile performance regularly