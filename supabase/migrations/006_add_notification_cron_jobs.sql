-- Schedule daily digest email job to run daily at 4 AM UTC
-- This sends a daily summary email to users after suggestions are generated
SELECT cron.schedule(
  'send-daily-digest-emails',
  '0 4 * * *', -- Daily at 4 AM UTC
  $$
  SELECT
    net.http_post(
      url:='https://' || current_setting('app.settings.supabase_url') || '/functions/v1/send-daily-digest',
      headers:=jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.supabase_service_key')),
      body:=jsonb_build_object('trigger', 'cron')
    ) as request_id;
  $$
);

-- Schedule data cleanup job to run daily at 5 AM UTC
-- This archives old notifications and deletes old audit events
SELECT cron.schedule(
  'cleanup-old-data-daily',
  '0 5 * * *', -- Daily at 5 AM UTC
  $$
  SELECT
    net.http_post(
      url:='https://' || current_setting('app.settings.supabase_url') || '/functions/v1/cleanup-old-data',
      headers:=jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.supabase_service_key')),
      body:=jsonb_build_object('trigger', 'cron')
    ) as request_id;
  $$
);

-- Schedule reported generation job for scheduled reports
-- This runs at 6 AM UTC daily to check for scheduled reports due to run
-- and generates/sends them via email
SELECT cron.schedule(
  'process-scheduled-reports-daily',
  '0 6 * * *', -- Daily at 6 AM UTC
  $$
  SELECT
    net.http_post(
      url:='https://' || current_setting('app.settings.supabase_url') || '/functions/v1/process-scheduled-reports',
      headers:=jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.supabase_service_key')),
      body:=jsonb_build_object('trigger', 'cron')
    ) as request_id;
  $$
);

-- Add indexes for new tables
CREATE INDEX IF NOT EXISTS idx_notifications_priority
ON notifications(priority, read);

CREATE INDEX IF NOT EXISTS idx_notifications_archive_status
ON notifications(archived, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_events_user_id
ON audit_events(user_id);

CREATE INDEX IF NOT EXISTS idx_action_logs_completed_at
ON action_logs(completed_at DESC)
WHERE status = 'completed';

CREATE INDEX IF NOT EXISTS idx_campaign_notes_updated_at
ON campaign_notes(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_scheduled_reports_next_run
ON scheduled_reports(frequency, scheduled_time)
WHERE enabled = TRUE;

-- Create view for monitoring all scheduled jobs
DROP VIEW IF EXISTS all_cron_jobs CASCADE;
CREATE OR REPLACE VIEW all_cron_jobs AS
SELECT
  jobid,
  schedule_expr,
  command,
  nodename,
  nodeport,
  database,
  username,
  active,
  CASE
    WHEN schedule_expr = '0 2 * * *' THEN 'Token Refresh'
    WHEN schedule_expr = '0 */2 * * *' THEN 'Campaign Sync'
    WHEN schedule_expr = '0 1 * * *' THEN 'Metrics Capture'
    WHEN schedule_expr = '0 3 * * *' THEN 'Generate Suggestions'
    WHEN schedule_expr = '0 4 * * *' THEN 'Daily Digest'
    WHEN schedule_expr = '0 5 * * *' THEN 'Data Cleanup'
    WHEN schedule_expr = '0 6 * * *' THEN 'Process Reports'
    ELSE 'Unknown'
  END as job_name,
  CASE
    WHEN schedule_expr = '0 2 * * *' THEN '2:00 AM UTC'
    WHEN schedule_expr = '0 */2 * * *' THEN 'Every 2 hours'
    WHEN schedule_expr = '0 1 * * *' THEN '1:00 AM UTC'
    WHEN schedule_expr = '0 3 * * *' THEN '3:00 AM UTC'
    WHEN schedule_expr = '0 4 * * *' THEN '4:00 AM UTC'
    WHEN schedule_expr = '0 5 * * *' THEN '5:00 AM UTC'
    WHEN schedule_expr = '0 6 * * *' THEN '6:00 AM UTC'
    ELSE 'Unknown'
  END as schedule_display
FROM cron.job;

-- Grant necessary permissions
GRANT SELECT ON all_cron_jobs TO authenticated;
GRANT SELECT ON cron_job_status TO authenticated;
