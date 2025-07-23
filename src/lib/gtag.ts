export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

// Basic page view tracking
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID!, {
      page_path: url,
    })
  }
}

// Generic event tracking
interface GtagEvent {
  action: string
  category: string
  label?: string
  value?: number
}

export const event = ({ action, category, label, value }: GtagEvent) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Enhanced ecommerce events
interface EcommerceItem {
  item_id: string
  item_name: string
  item_category?: string
  item_variant?: string
  price: number
  quantity: number
}

export const ecommerce = {
  // View item list (template gallery)
  viewItemList: (items: EcommerceItem[], list_name: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_item_list', {
        item_list_name: list_name,
        items: items,
      })
    }
  },

  // Select item (template selection)
  selectItem: (items: EcommerceItem[], list_name: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'select_item', {
        item_list_name: list_name,
        items: items,
      })
    }
  },

  // Begin checkout
  beginCheckout: (items: EcommerceItem[], value: number, currency = 'USD') => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'begin_checkout', {
        currency: currency,
        value: value,
        items: items,
      })
    }
  },

  // Purchase
  purchase: (
    transaction_id: string,
    value: number,
    items: EcommerceItem[],
    currency = 'USD'
  ) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: transaction_id,
        value: value,
        currency: currency,
        items: items,
      })
    }
  },
}

// User properties
export const setUserProperties = (properties: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('set', 'user_properties', properties)
  }
}

// Custom dimensions
export const setCustomDimension = (dimension: string, value: any) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID!, {
      custom_map: { [dimension]: value },
    })
  }
}

// Timing events
export const timing = (name: string, value: number, category?: string, label?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'timing_complete', {
      name: name,
      value: Math.round(value),
      event_category: category || 'Performance',
      event_label: label,
    })
  }
}

// Exception tracking
export const exception = (description: string, fatal = false) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'exception', {
      description: description,
      fatal: fatal,
    })
  }
}

// Type declarations for TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}