import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type AnalyticsEvent = {
  event: 'template_created' | 'template_edited' | 'template_exported' | 'template_sent' | 'template_viewed';
  templateId?: string;
  templateCategory?: string;
  exportType?: string;
  metadata?: Record<string, any>;
};

export async function trackEvent(event: AnalyticsEvent) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    await supabase.from('analytics_events').insert({
      user_id: user.id,
      event_type: event.event,
      template_id: event.templateId,
      template_category: event.templateCategory,
      metadata: event.metadata,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Analytics error:', error);
  }
}

// Template performance metrics
export async function getTemplateMetrics(templateId: string) {
  const { data, error } = await supabase
    .from('template_analytics')
    .select('*')
    .eq('template_id', templateId);

  if (error) throw error;

  const metrics = {
    views: 0,
    exports: 0,
    sends: 0,
    conversionRate: 0
  };

  data?.forEach(record => {
    if (record.action === 'view') metrics.views++;
    if (record.action === 'export') metrics.exports++;
    if (record.action === 'send') metrics.sends++;
  });

  if (metrics.views > 0) {
    metrics.conversionRate = ((metrics.exports + metrics.sends) / metrics.views) * 100;
  }

  return metrics;
}