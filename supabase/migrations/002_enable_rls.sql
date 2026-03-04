-- Migration: 002_enable_rls.sql
-- Description: Enable Row Level Security (RLS) and create policies
-- Date: 2026-03-04

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================
ALTER TABLE ad_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- AD_ACCOUNTS POLICIES
-- ============================================================================
CREATE POLICY "Users can view own ad accounts"
  ON ad_accounts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ad accounts"
  ON ad_accounts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ad accounts"
  ON ad_accounts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own ad accounts"
  ON ad_accounts
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- CAMPAIGNS POLICIES
-- ============================================================================
CREATE POLICY "Users can view campaigns from own accounts"
  ON campaigns
  FOR SELECT
  USING (
    ad_account_id IN (
      SELECT id FROM ad_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert campaigns in own accounts"
  ON campaigns
  FOR INSERT
  WITH CHECK (
    ad_account_id IN (
      SELECT id FROM ad_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update campaigns in own accounts"
  ON campaigns
  FOR UPDATE
  USING (
    ad_account_id IN (
      SELECT id FROM ad_accounts WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    ad_account_id IN (
      SELECT id FROM ad_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete campaigns in own accounts"
  ON campaigns
  FOR DELETE
  USING (
    ad_account_id IN (
      SELECT id FROM ad_accounts WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- AD_SETS POLICIES
-- ============================================================================
CREATE POLICY "Users can view ad sets from own campaigns"
  ON ad_sets
  FOR SELECT
  USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE ad_account_id IN (
        SELECT id FROM ad_accounts WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert ad sets in own campaigns"
  ON ad_sets
  FOR INSERT
  WITH CHECK (
    campaign_id IN (
      SELECT id FROM campaigns WHERE ad_account_id IN (
        SELECT id FROM ad_accounts WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update ad sets in own campaigns"
  ON ad_sets
  FOR UPDATE
  USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE ad_account_id IN (
        SELECT id FROM ad_accounts WHERE user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    campaign_id IN (
      SELECT id FROM campaigns WHERE ad_account_id IN (
        SELECT id FROM ad_accounts WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete ad sets in own campaigns"
  ON ad_sets
  FOR DELETE
  USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE ad_account_id IN (
        SELECT id FROM ad_accounts WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- ADS POLICIES
-- ============================================================================
CREATE POLICY "Users can view ads from own ad sets"
  ON ads
  FOR SELECT
  USING (
    ad_set_id IN (
      SELECT id FROM ad_sets WHERE campaign_id IN (
        SELECT id FROM campaigns WHERE ad_account_id IN (
          SELECT id FROM ad_accounts WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can insert ads in own ad sets"
  ON ads
  FOR INSERT
  WITH CHECK (
    ad_set_id IN (
      SELECT id FROM ad_sets WHERE campaign_id IN (
        SELECT id FROM campaigns WHERE ad_account_id IN (
          SELECT id FROM ad_accounts WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can update ads in own ad sets"
  ON ads
  FOR UPDATE
  USING (
    ad_set_id IN (
      SELECT id FROM ad_sets WHERE campaign_id IN (
        SELECT id FROM campaigns WHERE ad_account_id IN (
          SELECT id FROM ad_accounts WHERE user_id = auth.uid()
        )
      )
    )
  )
  WITH CHECK (
    ad_set_id IN (
      SELECT id FROM ad_sets WHERE campaign_id IN (
        SELECT id FROM campaigns WHERE ad_account_id IN (
          SELECT id FROM ad_accounts WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can delete ads in own ad sets"
  ON ads
  FOR DELETE
  USING (
    ad_set_id IN (
      SELECT id FROM ad_sets WHERE campaign_id IN (
        SELECT id FROM campaigns WHERE ad_account_id IN (
          SELECT id FROM ad_accounts WHERE user_id = auth.uid()
        )
      )
    )
  );

-- ============================================================================
-- CAMPAIGN_METRICS POLICIES
-- ============================================================================
CREATE POLICY "Users can view metrics for own campaigns"
  ON campaign_metrics
  FOR SELECT
  USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE ad_account_id IN (
        SELECT id FROM ad_accounts WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert metrics for own campaigns"
  ON campaign_metrics
  FOR INSERT
  WITH CHECK (
    campaign_id IN (
      SELECT id FROM campaigns WHERE ad_account_id IN (
        SELECT id FROM ad_accounts WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update metrics for own campaigns"
  ON campaign_metrics
  FOR UPDATE
  USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE ad_account_id IN (
        SELECT id FROM ad_accounts WHERE user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    campaign_id IN (
      SELECT id FROM campaigns WHERE ad_account_id IN (
        SELECT id FROM ad_accounts WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- AI_SUGGESTIONS POLICIES
-- ============================================================================
CREATE POLICY "Users can view suggestions for own accounts"
  ON ai_suggestions
  FOR SELECT
  USING (
    account_id IN (
      SELECT id FROM ad_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert suggestions for own accounts"
  ON ai_suggestions
  FOR INSERT
  WITH CHECK (
    account_id IN (
      SELECT id FROM ad_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update suggestions for own accounts"
  ON ai_suggestions
  FOR UPDATE
  USING (
    account_id IN (
      SELECT id FROM ad_accounts WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    account_id IN (
      SELECT id FROM ad_accounts WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- RULES POLICIES
-- ============================================================================
CREATE POLICY "Users can view own rules"
  ON rules
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rules"
  ON rules
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rules"
  ON rules
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own rules"
  ON rules
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- ACTION_LOGS POLICIES
-- ============================================================================
CREATE POLICY "Users can view own action logs"
  ON action_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert action logs"
  ON action_logs
  FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- NOTIFICATIONS POLICIES
-- ============================================================================
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications
  FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- CAMPAIGN_NOTES POLICIES
-- ============================================================================
CREATE POLICY "Users can view notes for own campaigns"
  ON campaign_notes
  FOR SELECT
  USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE ad_account_id IN (
        SELECT id FROM ad_accounts WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert notes in own campaigns"
  ON campaign_notes
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND campaign_id IN (
      SELECT id FROM campaigns WHERE ad_account_id IN (
        SELECT id FROM ad_accounts WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update own notes"
  ON campaign_notes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON campaign_notes
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- SYNC_LOGS POLICIES
-- ============================================================================
CREATE POLICY "Users can view sync logs for own accounts"
  ON sync_logs
  FOR SELECT
  USING (
    account_id IN (
      SELECT id FROM ad_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert sync logs"
  ON sync_logs
  FOR INSERT
  WITH CHECK (true);
