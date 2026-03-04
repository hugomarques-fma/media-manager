-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant usage to postgres user (default Supabase user)
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA cron TO postgres;

-- Schedule token refresh job to run daily at 2 AM UTC
-- This checks for tokens expiring in the next 24 hours and refreshes them
SELECT cron.schedule(
  'refresh-expiring-tokens',
  '0 2 * * *', -- Daily at 2 AM UTC
  $$
  SELECT
    net.http_post(
      url:='https://' || current_setting('app.settings.supabase_url') || '/functions/v1/refresh-tokens',
      headers:=jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.supabase_service_key')),
      body:=jsonb_build_object('trigger', 'cron')
    ) as request_id;
  $$
);

-- Schedule campaign sync job to run every 2 hours
-- This syncs campaign data from Meta API
SELECT cron.schedule(
  'sync-campaigns-scheduled',
  '0 */2 * * *', -- Every 2 hours
  $$
  SELECT
    net.http_post(
      url:='https://' || current_setting('app.settings.supabase_url') || '/functions/v1/sync-campaigns',
      headers:=jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.supabase_service_key')),
      body:=jsonb_build_object('trigger', 'cron')
    ) as request_id;
  $$
);

-- Schedule metrics capture job to run daily at 1 AM UTC
-- This captures daily metrics for all campaigns
SELECT cron.schedule(
  'capture-metrics-daily',
  '0 1 * * *', -- Daily at 1 AM UTC
  $$
  SELECT
    net.http_post(
      url:='https://' || current_setting('app.settings.supabase_url') || '/functions/v1/capture-metrics',
      headers:=jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.supabase_service_key')),
      body:=jsonb_build_object('trigger', 'cron', 'date', CURRENT_DATE::text)
    ) as request_id;
  $$
);

-- Schedule suggestion generation job to run daily at 3 AM UTC
-- This analyzes campaign performance and generates AI suggestions
SELECT cron.schedule(
  'generate-suggestions-daily',
  '0 3 * * *', -- Daily at 3 AM UTC (2 hours after metrics capture)
  $$
  SELECT
    net.http_post(
      url:='https://' || current_setting('app.settings.supabase_url') || '/functions/v1/generate-suggestions',
      headers:=jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.supabase_service_key')),
      body:=jsonb_build_object('trigger', 'cron')
    ) as request_id;
  $$
);

-- Add index on token_expires_at for efficient token refresh queries
CREATE INDEX IF NOT EXISTS idx_ad_accounts_token_expires_at
ON ad_accounts(token_expires_at)
WHERE status = 'connected';

-- Add index on campaign status for quick filtering
CREATE INDEX IF NOT EXISTS idx_campaigns_status
ON campaigns(status, ad_account_id);

-- Add index on metrics date for time-range queries
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_date
ON campaign_metrics(campaign_id, date DESC);

-- Create view for monitoring job runs
CREATE OR REPLACE VIEW cron_job_status AS
SELECT
  jobid,
  schedule_expr,
  command,
  nodename,
  nodeport,
  database,
  username,
  active
FROM cron.job;

-- Grant access to public schema (if needed)
GRANT EXECUTE ON FUNCTION net.http_post TO postgres;
