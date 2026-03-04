-- Add refresh_token field to ad_accounts if not exists
ALTER TABLE ad_accounts
ADD COLUMN IF NOT EXISTS refresh_token TEXT;

-- Add last_synced_at to track when last sync occurred
ALTER TABLE ad_accounts
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE;

-- Add next_sync_at to indicate when next sync is scheduled
ALTER TABLE ad_accounts
ADD COLUMN IF NOT EXISTS next_sync_at TIMESTAMP WITH TIME ZONE;

-- Add sync_enabled flag to allow users to disable automatic syncing
ALTER TABLE ad_accounts
ADD COLUMN IF NOT EXISTS sync_enabled BOOLEAN DEFAULT true;

-- Create index for last_synced_at queries
CREATE INDEX IF NOT EXISTS idx_ad_accounts_last_synced_at
ON ad_accounts(last_synced_at DESC)
WHERE status = 'connected';

-- Add is_email_verified to auth_logs for tracking
ALTER TABLE IF EXISTS auth_logs
ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT false;

-- Create materialized view for sync statistics
CREATE OR REPLACE VIEW sync_statistics AS
SELECT
  aa.id,
  aa.user_id,
  aa.name,
  aa.status,
  COUNT(sl.id) FILTER (WHERE sl.status = 'success') as successful_syncs,
  COUNT(sl.id) FILTER (WHERE sl.status = 'failed') as failed_syncs,
  COUNT(sl.id) FILTER (WHERE sl.status = 'partial') as partial_syncs,
  MAX(sl.completed_at) as last_sync_time,
  ROUND(
    COUNT(sl.id) FILTER (WHERE sl.status = 'success')::NUMERIC /
    NULLIF(COUNT(sl.id), 0) * 100, 2
  ) as success_rate
FROM ad_accounts aa
LEFT JOIN sync_logs sl ON aa.id = sl.account_id
GROUP BY aa.id, aa.user_id, aa.name, aa.status;

-- Grant access to sync_statistics view
GRANT SELECT ON sync_statistics TO authenticated;

-- Create function to update next_sync_at based on sync frequency
CREATE OR REPLACE FUNCTION update_next_sync_time()
RETURNS TRIGGER AS $$
BEGIN
  -- Update next_sync_at to 2 hours from now (our cron schedule)
  NEW.next_sync_at := NOW() + INTERVAL '2 hours';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update next_sync_at when sync completes
CREATE TRIGGER trigger_update_next_sync_time
AFTER INSERT ON sync_logs
FOR EACH ROW
EXECUTE FUNCTION update_next_sync_time();

-- Add comment documenting the sync fields
COMMENT ON COLUMN ad_accounts.last_synced_at IS 'Timestamp of the last successful or partial sync';
COMMENT ON COLUMN ad_accounts.next_sync_at IS 'Predicted time of next scheduled sync (updated by cron triggers)';
COMMENT ON COLUMN ad_accounts.sync_enabled IS 'Flag to enable/disable automatic background syncing for this account';
COMMENT ON COLUMN ad_accounts.refresh_token IS 'Meta refresh token for long-term token management';
