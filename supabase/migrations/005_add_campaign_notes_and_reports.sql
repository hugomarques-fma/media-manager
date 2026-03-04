-- Create campaign_notes table
CREATE TABLE IF NOT EXISTS campaign_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES ad_accounts(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  INDEX idx_campaign_notes_campaign_id (campaign_id),
  INDEX idx_campaign_notes_account_id (account_id),
  INDEX idx_campaign_notes_user_id (user_id),
  INDEX idx_campaign_notes_created_at (created_at)
);

-- Create scheduled_reports table
CREATE TABLE IF NOT EXISTS scheduled_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES ad_accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('campaign', 'account', 'performance', 'roi')),
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  scheduled_time TIME DEFAULT '09:00:00',
  recipients TEXT[] NOT NULL,
  filters JSONB,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_run_at TIMESTAMPTZ,
  INDEX idx_scheduled_reports_account_id (account_id),
  INDEX idx_scheduled_reports_enabled (enabled),
  INDEX idx_scheduled_reports_frequency (frequency)
);

-- Enable RLS on campaign_notes
ALTER TABLE campaign_notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for campaign_notes
CREATE POLICY "Users can view campaign notes in their accounts"
  ON campaign_notes
  FOR SELECT
  USING (
    account_id IN (
      SELECT id FROM ad_accounts
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create campaign notes in their accounts"
  ON campaign_notes
  FOR INSERT
  WITH CHECK (
    account_id IN (
      SELECT id FROM ad_accounts
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own campaign notes"
  ON campaign_notes
  FOR UPDATE
  USING (
    user_id = auth.uid() AND
    account_id IN (
      SELECT id FROM ad_accounts
      WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    user_id = auth.uid() AND
    account_id IN (
      SELECT id FROM ad_accounts
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own campaign notes"
  ON campaign_notes
  FOR DELETE
  USING (
    user_id = auth.uid() AND
    account_id IN (
      SELECT id FROM ad_accounts
      WHERE owner_id = auth.uid()
    )
  );

-- Enable RLS on scheduled_reports
ALTER TABLE scheduled_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for scheduled_reports
CREATE POLICY "Users can view scheduled reports in their accounts"
  ON scheduled_reports
  FOR SELECT
  USING (
    account_id IN (
      SELECT id FROM ad_accounts
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create scheduled reports in their accounts"
  ON scheduled_reports
  FOR INSERT
  WITH CHECK (
    account_id IN (
      SELECT id FROM ad_accounts
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update scheduled reports in their accounts"
  ON scheduled_reports
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

CREATE POLICY "Users can delete scheduled reports in their accounts"
  ON scheduled_reports
  FOR DELETE
  USING (
    account_id IN (
      SELECT id FROM ad_accounts
      WHERE owner_id = auth.uid()
    )
  );

-- Create trigger for updating campaign_notes updated_at
CREATE OR REPLACE FUNCTION update_campaign_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER campaign_notes_updated_at BEFORE UPDATE ON campaign_notes
  FOR EACH ROW EXECUTE FUNCTION update_campaign_notes_updated_at();

-- Create trigger for updating scheduled_reports updated_at
CREATE OR REPLACE FUNCTION update_scheduled_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER scheduled_reports_updated_at BEFORE UPDATE ON scheduled_reports
  FOR EACH ROW EXECUTE FUNCTION update_scheduled_reports_updated_at();
