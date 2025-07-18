-- Create security_logs table for monitoring security events
CREATE TABLE IF NOT EXISTS public.security_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  resource TEXT,
  action TEXT,
  result TEXT CHECK (result IN ('success', 'failure') OR result IS NULL),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for common queries
CREATE INDEX idx_security_logs_event_type ON public.security_logs(event_type);
CREATE INDEX idx_security_logs_severity ON public.security_logs(severity);
CREATE INDEX idx_security_logs_user_id ON public.security_logs(user_id);
CREATE INDEX idx_security_logs_ip_address ON public.security_logs(ip_address);
CREATE INDEX idx_security_logs_created_at ON public.security_logs(created_at DESC);

-- Create a composite index for time-based queries
CREATE INDEX idx_security_logs_created_severity ON public.security_logs(created_at DESC, severity);

-- Create RLS policies
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can view their own security logs
CREATE POLICY "Users can view their own security logs"
  ON public.security_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert security logs
CREATE POLICY "Service role can insert security logs"
  ON public.security_logs
  FOR INSERT
  WITH CHECK (true);

-- Service role can read all security logs
CREATE POLICY "Service role can read all security logs"
  ON public.security_logs
  FOR SELECT
  USING (true);

-- Add comment to table
COMMENT ON TABLE public.security_logs IS 'Stores security events for monitoring and audit purposes';

-- Create a function to automatically clean up old logs
CREATE OR REPLACE FUNCTION cleanup_old_security_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM public.security_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule the cleanup function to run daily (requires pg_cron extension)
-- Note: This needs to be set up separately in Supabase dashboard or via pg_cron
-- SELECT cron.schedule('cleanup-security-logs', '0 2 * * *', 'SELECT cleanup_old_security_logs();');