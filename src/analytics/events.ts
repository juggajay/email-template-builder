// analytics/events.ts - Complete event tracking for ZebaMail

import * as gtag from '@/lib/gtag'

// Type definitions
type AuthMethod = 'email' | 'google'
type ExportFormat = 'html' | 'klaviyo' | 'mailchimp' | 'shopify' | 'omnisend'
type SubscriptionPlan = 'free' | 'pro' | 'agency'
type EditorSource = 'dashboard' | 'template' | 'blank' | 'import'
type SupportMethod = 'email' | 'chat' | 'form'
type TemplateCategory = 'abandoned-cart' | 'product-launch' | 'order-confirmation' | 'welcome' | 'promotional'

// User Authentication Events
export const trackSignup = (method: AuthMethod, referralSource?: string) => {
  gtag.event({
    action: 'sign_up',
    category: 'authentication',
    label: method,
  })

  // Set user properties for segmentation
  if (referralSource) {
    gtag.setUserProperties({
      referral_source: referralSource,
      signup_method: method,
    })
  }
}

export const trackLogin = (method: AuthMethod) => {
  gtag.event({
    action: 'login',
    category: 'authentication',
    label: method,
  })
}

export const trackLogout = () => {
  gtag.event({
    action: 'logout',
    category: 'authentication',
  })
}

// Template Events
export const trackTemplateView = (templateName: string, category: TemplateCategory, isPremium: boolean = false) => {
  gtag.event({
    action: 'view_template',
    category: 'engagement',
    label: `${category}/${templateName}`,
    value: isPremium ? 1 : 0,
  })

  // Enhanced ecommerce tracking
  gtag.ecommerce.viewItemList([{
    item_id: templateName,
    item_name: templateName,
    item_category: category,
    item_variant: isPremium ? 'premium' : 'free',
    price: 0,
    quantity: 1,
  }], 'template_gallery')
}

export const trackTemplateEdit = (templateName: string, category: TemplateCategory, editDuration?: number) => {
  gtag.event({
    action: 'edit_template',
    category: 'engagement',
    label: templateName,
    value: editDuration,
  })
}

export const trackTemplateSave = (templateName: string, isAutoSave: boolean = false) => {
  gtag.event({
    action: isAutoSave ? 'auto_save_template' : 'save_template',
    category: 'engagement',
    label: templateName,
  })
}

export const trackTemplateExport = (format: ExportFormat, templateName: string, fileSize?: number) => {
  gtag.event({
    action: 'export_template',
    category: 'conversion',
    label: format,
    value: fileSize,
  })

  // Track as conversion goal
  gtag.event({
    action: `export_${format}`,
    category: 'goal_completion',
    label: templateName,
    value: 1,
  })
}

export const trackTemplateDelete = (templateName: string) => {
  gtag.event({
    action: 'delete_template',
    category: 'engagement',
    label: templateName,
  })
}

export const trackTemplateDuplicate = (templateName: string) => {
  gtag.event({
    action: 'duplicate_template',
    category: 'engagement',
    label: templateName,
  })
}

// Editor Events
export const trackEditorOpen = (source: EditorSource) => {
  gtag.event({
    action: 'open_editor',
    category: 'engagement',
    label: source,
  })

  gtag.timing('editor_load_time', Date.now(), 'Editor', source)
}

export const trackEditorAction = (action: string, elementType: string) => {
  gtag.event({
    action: `editor_${action}`,
    category: 'editor_usage',
    label: elementType,
  })
}

export const trackMergeTagUsed = (tagType: string, tagName: string) => {
  gtag.event({
    action: 'use_merge_tag',
    category: 'feature_usage',
    label: `${tagType}/${tagName}`,
  })
}

export const trackCSSInlineUsed = () => {
  gtag.event({
    action: 'use_css_inline',
    category: 'feature_usage',
    label: 'css_inline',
  })
}

export const trackImageUpload = (source: 'local' | 'url' | 'stock', fileSize?: number) => {
  gtag.event({
    action: 'upload_image',
    category: 'editor_usage',
    label: source,
    value: fileSize,
  })
}

export const trackPreviewMode = (device: 'desktop' | 'mobile') => {
  gtag.event({
    action: 'preview_mode',
    category: 'editor_usage',
    label: device,
  })
}

// Shopify Integration Events
export const trackShopifyConnect = (success: boolean, shopDomain?: string) => {
  gtag.event({
    action: 'connect_shopify',
    category: 'integration',
    label: success ? 'success' : 'failed',
  })

  if (success && shopDomain) {
    gtag.setUserProperties({
      shopify_connected: true,
      shopify_domain: shopDomain,
    })
  }
}

export const trackShopifyProductImport = (productCount: number, collectionName?: string) => {
  gtag.event({
    action: 'import_products',
    category: 'integration',
    label: collectionName || 'all_products',
    value: productCount,
  })
}

export const trackShopifySync = (syncType: 'manual' | 'automatic', itemsSynced: number) => {
  gtag.event({
    action: 'sync_shopify',
    category: 'integration',
    label: syncType,
    value: itemsSynced,
  })
}

// Subscription Events
export const trackPricingView = (source?: string) => {
  gtag.event({
    action: 'view_pricing',
    category: 'conversion',
    label: source,
  })
}

export const trackPlanSelected = (plan: SubscriptionPlan, billingCycle: 'monthly' | 'yearly' = 'monthly') => {
  gtag.event({
    action: 'select_plan',
    category: 'conversion',
    label: `${plan}_${billingCycle}`,
  })

  // Enhanced ecommerce
  const prices = {
    free: 0,
    pro: billingCycle === 'monthly' ? 29 : 290,
    agency: billingCycle === 'monthly' ? 99 : 990,
  }

  gtag.ecommerce.selectItem([{
    item_id: `${plan}_${billingCycle}`,
    item_name: `ZebaMail ${plan} Plan`,
    item_category: 'subscription',
    item_variant: billingCycle,
    price: prices[plan],
    quantity: 1,
  }], 'pricing_page')
}

export const trackCheckoutStarted = (plan: SubscriptionPlan, price: number, billingCycle: 'monthly' | 'yearly') => {
  gtag.event({
    action: 'begin_checkout',
    category: 'ecommerce',
    label: plan,
    value: price,
  })

  // Enhanced ecommerce
  gtag.ecommerce.beginCheckout([{
    item_id: `${plan}_${billingCycle}`,
    item_name: `ZebaMail ${plan} Plan`,
    item_category: 'subscription',
    item_variant: billingCycle,
    price: price,
    quantity: 1,
  }], price)
}

export const trackPurchase = (
  plan: SubscriptionPlan, 
  price: number, 
  orderId: string,
  billingCycle: 'monthly' | 'yearly'
) => {
  // Standard event
  gtag.event({
    action: 'purchase',
    category: 'ecommerce',
    label: plan,
    value: price,
  })

  // Enhanced ecommerce
  gtag.ecommerce.purchase(orderId, price, [{
    item_id: `${plan}_${billingCycle}`,
    item_name: `ZebaMail ${plan} Plan`,
    item_category: 'subscription',
    item_variant: billingCycle,
    price: price,
    quantity: 1,
  }])

  // Update user properties
  gtag.setUserProperties({
    subscription_plan: plan,
    subscription_status: 'active',
    billing_cycle: billingCycle,
  })
}

export const trackSubscriptionCancelled = (plan: SubscriptionPlan, reason?: string) => {
  gtag.event({
    action: 'cancel_subscription',
    category: 'retention',
    label: reason || 'no_reason',
    value: plan === 'pro' ? 29 : plan === 'agency' ? 99 : 0,
  })

  gtag.setUserProperties({
    subscription_status: 'cancelled',
  })
}

// SEO Landing Page Events
export const trackLandingPageView = (page: string, utm_source?: string, utm_campaign?: string) => {
  gtag.event({
    action: 'view_landing_page',
    category: 'seo',
    label: page,
  })

  if (utm_source || utm_campaign) {
    gtag.event({
      action: 'campaign_view',
      category: 'marketing',
      label: `${utm_source || 'direct'}/${utm_campaign || 'none'}`,
    })
  }
}

export const trackCTAClick = (ctaType: string, location: string, destination?: string) => {
  gtag.event({
    action: 'click_cta',
    category: 'engagement',
    label: `${location}/${ctaType}`,
  })

  if (destination) {
    gtag.event({
      action: 'outbound_click',
      category: 'navigation',
      label: destination,
    })
  }
}

export const trackScrollDepth = (percentage: number, page: string) => {
  gtag.event({
    action: 'scroll',
    category: 'engagement',
    label: page,
    value: percentage,
  })
}

// Support Events
export const trackSupportContact = (method: SupportMethod, topic?: string) => {
  gtag.event({
    action: 'contact_support',
    category: 'support',
    label: `${method}${topic ? `/${topic}` : ''}`,
  })
}

export const trackHelpArticleView = (articleTitle: string) => {
  gtag.event({
    action: 'view_help_article',
    category: 'support',
    label: articleTitle,
  })
}

export const trackFeedback = (rating: number, feature?: string) => {
  gtag.event({
    action: 'submit_feedback',
    category: 'feedback',
    label: feature || 'general',
    value: rating,
  })
}

// Feature Adoption Events
export const trackFeatureDiscovery = (feature: string) => {
  gtag.event({
    action: 'discover_feature',
    category: 'feature_adoption',
    label: feature,
  })
}

export const trackFeatureFirstUse = (feature: string) => {
  gtag.event({
    action: 'first_use_feature',
    category: 'feature_adoption',
    label: feature,
  })

  gtag.setUserProperties({
    [`used_${feature}`]: true,
  })
}

export const trackFeatureUsage = (feature: string, usageCount: number) => {
  gtag.event({
    action: 'use_feature',
    category: 'feature_usage',
    label: feature,
    value: usageCount,
  })
}

// Error Tracking
export const trackError = (errorType: string, errorMessage: string, fatal: boolean = false) => {
  gtag.exception(errorMessage, fatal)
  
  gtag.event({
    action: 'error_occurred',
    category: 'errors',
    label: errorType,
  })
}

// Performance Tracking
export const trackPerformance = (metric: string, value: number, page?: string) => {
  gtag.timing(metric, value, 'Performance', page)
}

// Session Tracking
export const trackSessionDuration = (duration: number) => {
  gtag.event({
    action: 'session_duration',
    category: 'engagement',
    value: Math.round(duration / 1000), // Convert to seconds
  })
}

export const trackPageEngagement = (timeOnPage: number, page: string) => {
  gtag.event({
    action: 'page_engagement',
    category: 'engagement',
    label: page,
    value: Math.round(timeOnPage / 1000), // Convert to seconds
  })
}

// A/B Testing Events
export const trackExperiment = (experimentName: string, variant: string) => {
  gtag.event({
    action: 'experiment_view',
    category: 'experiments',
    label: `${experimentName}/${variant}`,
  })

  gtag.setCustomDimension('experiment_variant', `${experimentName}:${variant}`)
}

// Onboarding Events
export const trackOnboardingStart = () => {
  gtag.event({
    action: 'start_onboarding',
    category: 'onboarding',
  })
}

export const trackOnboardingStep = (step: number, stepName: string) => {
  gtag.event({
    action: 'complete_onboarding_step',
    category: 'onboarding',
    label: stepName,
    value: step,
  })
}

export const trackOnboardingComplete = (completionTime: number) => {
  gtag.event({
    action: 'complete_onboarding',
    category: 'onboarding',
    value: Math.round(completionTime / 1000), // Convert to seconds
  })

  gtag.setUserProperties({
    onboarding_completed: true,
  })
}

// Example implementation in your components:

/*
// In your template export button:
import { trackTemplateExport } from '@/analytics/events'

const handleExport = (format: ExportFormat) => {
  trackTemplateExport(format, template.name, exportSize)
  // ... export logic
}

// In your pricing page:
import { trackPlanSelected, trackCheckoutStarted } from '@/analytics/events'

const handlePlanClick = (plan: SubscriptionPlan) => {
  trackPlanSelected(plan, billingCycle)
  trackCheckoutStarted(plan, calculatePrice(plan, billingCycle), billingCycle)
  // ... checkout logic
}

// In your editor:
import { trackMergeTagUsed, trackEditorAction } from '@/analytics/events'

const insertMergeTag = (tag: string) => {
  trackMergeTagUsed('customer', tag)
  // ... insert logic
}

const addElement = (elementType: string) => {
  trackEditorAction('add_element', elementType)
  // ... add element logic
}

// In your error boundary:
import { trackError } from '@/analytics/events'

componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  trackError('react_error', error.message, true)
  // ... error handling
}

// For A/B testing:
import { trackExperiment } from '@/analytics/events'

const variant = getExperimentVariant('new_editor_ui')
trackExperiment('new_editor_ui', variant)
*/