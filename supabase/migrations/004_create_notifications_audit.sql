-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES ad_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('campaign_alert', 'rule_executed', 'suggestion_created', 'performance_anomaly', 'budget_alert', 'sync_failed', 'token_expired', 'system_alert')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  read_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  data JSONB,
  INDEX idx_notifications_account_id (account_id),
  INDEX idx_notifications_user_id (user_id),
  INDEX idx_notifications_read (read),
  INDEX idx_notifications_created_at (created_at)
);

-- Create audit_events table
CREATE TABLE IF NOT EXISTS audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES ad_accounts(id) ON DELETE CASCADE,
  user_id UUID,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  changes JSONB,
  timestamp TIMESTAMPTZ DEFAULT now(),
  metadata JSONB,
  INDEX idx_audit_account_id (account_id),
  INDEX idx_audit_entity (entity_type, entity_id),
  INDEX idx_audit_timestamp (timestamp),
  INDEX idx_audit_event_type (event_type)
);

-- Create action_logs table (enhanced)
CREATE TABLE IF NOT EXISTS action_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES ad_accounts(id) ON DELETE CASCADE,
  user_id UUID,
  action_type TEXT NOT NULL,
  action_target TEXT,
  target_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  result JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  INDEX idx_action_logs_account_id (account_id),
  INDEX idx_action_logs_status (status),
  INDEX idx_action_logs_created_at (created_at)
);

-- Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own account notifications"
  ON notifications
  FOR SELECT
  USING (
    account_id IN (
      SELECT id FROM ad_accounts
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "System can create notifications"
  ON notifications
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  USING (
    account_id IN (
      SELECT id FROM ad_accounts
      WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    account_id IN (
      SELECT id FROM ad_accounts
      WHERE owner_id = auth.uid()
    )
  );

-- Enable RLS on audit_events
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for audit_events
CREATE POLICY "Users can view their own account audit events"
  ON audit_events
  FOR SELECT
  USING (
    account_id IN (
      SELECT id FROM ad_accounts
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "System can create audit events"
  ON audit_events
  FOR INSERT
  WITH CHECK (true);

-- Enable RLS on action_logs
ALTER TABLE action_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for action_logs
CREATE POLICY "Users can view their own account action logs"
  ON action_logs
  FOR SELECT
  USING (
    account_id IN (
      SELECT id FROM ad_accounts
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "System can create action logs"
  ON action_logs
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update action logs in their account"
  ON action_logs
  FOR UPDATE
  USING (
    account_id IN (
      SELECT id FROM ad_accounts
      WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    account_id IN (
      SELECT id FROM ad_accounts
      WHERE owner_id = auth.uid()
    )
  );

-- Create function to automatically log actions to audit_events
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_events (
      account_id,
      entity_type,
      entity_id,
      event_type,
      changes
    ) VALUES (
      NEW.account_id,
      TG_TABLE_NAME,
      NEW.id::TEXT,
      'created',
      jsonb_build_object('after', row_to_json(NEW))
    );
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_events (
      account_id,
      entity_type,
      entity_id,
      event_type,
      changes
    ) VALUES (
      NEW.account_id,
      TG_TABLE_NAME,
      NEW.id::TEXT,
      'updated',
      jsonb_build_object('before', row_to_json(OLD), 'after', row_to_json(NEW))
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_events (
      account_id,
      entity_type,
      entity_id,
      event_type,
      changes
    ) VALUES (
      OLD.account_id,
      TG_TABLE_NAME,
      OLD.id::TEXT,
      'deleted',
      jsonb_build_object('before', row_to_json(OLD))
    );
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers for key tables
CREATE TRIGGER audit_campaigns AFTER INSERT OR UPDATE OR DELETE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_rules AFTER INSERT OR UPDATE OR DELETE ON rules
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_ai_suggestions AFTER INSERT OR UPDATE OR DELETE ON ai_suggestions
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();
