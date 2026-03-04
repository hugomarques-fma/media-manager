-- Migration: 001_create_schema.sql
-- Description: Create core schema for media-manager platform
-- Date: 2026-03-04

-- ============================================================================
-- TABLE: users (managed by Supabase Auth, referenced here for RLS)
-- ============================================================================
-- Already managed by Supabase Auth, no need to create

-- ============================================================================
-- TABLE: ad_accounts
-- ============================================================================
CREATE TABLE IF NOT EXISTS ad_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meta_account_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  access_token TEXT NOT NULL, -- Will be encrypted
  refresh_token TEXT, -- Optional
  token_expires_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'connected', -- connected, expired, error
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_status CHECK (status IN ('connected', 'expired', 'error'))
);

CREATE INDEX idx_ad_accounts_user_id ON ad_accounts(user_id);
CREATE INDEX idx_ad_accounts_status ON ad_accounts(status);

-- ============================================================================
-- TABLE: campaigns
-- ============================================================================
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_account_id UUID NOT NULL REFERENCES ad_accounts(id) ON DELETE CASCADE,
  meta_campaign_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active', -- active, paused, archived
  objective TEXT, -- traffic, conversions, reach, engagement, leads
  daily_budget DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_status CHECK (status IN ('active', 'paused', 'archived')),
  UNIQUE(ad_account_id, meta_campaign_id)
);

CREATE INDEX idx_campaigns_ad_account_id ON campaigns(ad_account_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);

-- ============================================================================
-- TABLE: ad_sets
-- ============================================================================
CREATE TABLE IF NOT EXISTS ad_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  meta_adset_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  budget DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_status CHECK (status IN ('active', 'paused', 'archived')),
  UNIQUE(campaign_id, meta_adset_id)
);

CREATE INDEX idx_ad_sets_campaign_id ON ad_sets(campaign_id);
CREATE INDEX idx_ad_sets_status ON ad_sets(status);

-- ============================================================================
-- TABLE: ads
-- ============================================================================
CREATE TABLE IF NOT EXISTS ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_set_id UUID NOT NULL REFERENCES ad_sets(id) ON DELETE CASCADE,
  meta_ad_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  creative_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_status CHECK (status IN ('active', 'paused', 'archived')),
  UNIQUE(ad_set_id, meta_ad_id)
);

CREATE INDEX idx_ads_ad_set_id ON ads(ad_set_id);
CREATE INDEX idx_ads_status ON ads(status);

-- ============================================================================
-- TABLE: campaign_metrics (daily historical data)
-- ============================================================================
CREATE TABLE IF NOT EXISTS campaign_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  spend DECIMAL(12, 2) DEFAULT 0,
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  ctr DECIMAL(5, 3) DEFAULT 0, -- Click Through Rate (%)
  cpc DECIMAL(8, 2) DEFAULT 0, -- Cost Per Click
  cpm DECIMAL(8, 2) DEFAULT 0, -- Cost Per Mille
  conversions BIGINT DEFAULT 0,
  cpa DECIMAL(8, 2) DEFAULT 0, -- Cost Per Acquisition
  roas DECIMAL(5, 2) DEFAULT 0, -- Return on Ad Spend
  reach BIGINT DEFAULT 0,
  frequency DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id, date)
);

CREATE INDEX idx_campaign_metrics_campaign_date ON campaign_metrics(campaign_id, date);
CREATE INDEX idx_campaign_metrics_date ON campaign_metrics(date);

-- ============================================================================
-- TABLE: ai_suggestions
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES ad_accounts(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  type TEXT NOT NULL, -- budget, bids, ads, audiences, schedule, creative, other
  scope TEXT NOT NULL, -- campaign, ad_set, ad, account
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reasoning TEXT, -- Why was this suggested
  estimated_impact TEXT, -- "20% improvement in ROAS"
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, executing, executed, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected', 'executing', 'executed', 'failed')),
  CONSTRAINT valid_type CHECK (type IN ('budget', 'bids', 'ads', 'audiences', 'schedule', 'creative', 'other'))
);

CREATE INDEX idx_ai_suggestions_account_id ON ai_suggestions(account_id);
CREATE INDEX idx_ai_suggestions_status ON ai_suggestions(status);
CREATE INDEX idx_ai_suggestions_created_at ON ai_suggestions(created_at);

-- ============================================================================
-- TABLE: rules (user-defined automation rules)
-- ============================================================================
CREATE TABLE IF NOT EXISTS rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES ad_accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  scope TEXT NOT NULL, -- campaign, ad_set, ad, account
  conditions JSONB NOT NULL, -- { "and": [ { "metric": "cpa", "operator": ">", "value": 50, "period": "7d" } ] }
  actions JSONB NOT NULL, -- [ { "type": "pause", "target": "campaign" } ]
  frequency TEXT DEFAULT 'daily', -- hourly, daily, weekly
  mode TEXT DEFAULT 'suggestion', -- suggestion, automatic
  status TEXT DEFAULT 'active', -- active, paused, archived
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_scope CHECK (scope IN ('campaign', 'ad_set', 'ad', 'account')),
  CONSTRAINT valid_frequency CHECK (frequency IN ('hourly', 'daily', 'weekly')),
  CONSTRAINT valid_mode CHECK (mode IN ('suggestion', 'automatic')),
  CONSTRAINT valid_status CHECK (status IN ('active', 'paused', 'archived'))
);

CREATE INDEX idx_rules_user_id ON rules(user_id);
CREATE INDEX idx_rules_status ON rules(status);

-- ============================================================================
-- TABLE: action_logs (audit trail of all executed actions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS action_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  suggestion_id UUID REFERENCES ai_suggestions(id) ON DELETE SET NULL,
  rule_id UUID REFERENCES rules(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL, -- pause, resume, update_budget, etc.
  entity_type TEXT NOT NULL, -- campaign, ad_set, ad
  entity_id TEXT NOT NULL, -- Meta ID of entity
  before_state JSONB, -- Previous values
  after_state JSONB, -- New values
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'success', -- success, failed
  error_message TEXT,
  CONSTRAINT valid_status CHECK (status IN ('success', 'failed'))
);

CREATE INDEX idx_action_logs_user_id ON action_logs(user_id);
CREATE INDEX idx_action_logs_executed_at ON action_logs(executed_at);

-- ============================================================================
-- TABLE: notifications
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- suggestion_pending, suggestion_approved, rule_triggered, budget_exceeded, sync_error
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- Contextual data (campaign_id, rule_id, etc.)
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- ============================================================================
-- TABLE: campaign_notes
-- ============================================================================
CREATE TABLE IF NOT EXISTS campaign_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_campaign_notes_campaign_id ON campaign_notes(campaign_id);
CREATE INDEX idx_campaign_notes_user_id ON campaign_notes(user_id);

-- ============================================================================
-- TABLE: sync_logs (track API synchronization)
-- ============================================================================
CREATE TABLE IF NOT EXISTS sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES ad_accounts(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL, -- campaigns, metrics, all
  status TEXT DEFAULT 'success', -- success, failed
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  CONSTRAINT valid_status CHECK (status IN ('success', 'failed'))
);

CREATE INDEX idx_sync_logs_account_id ON sync_logs(account_id);
CREATE INDEX idx_sync_logs_started_at ON sync_logs(started_at);

-- ============================================================================
-- Timestamp update functions
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trigger_update_ad_accounts_updated_at
BEFORE UPDATE ON ad_accounts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_campaigns_updated_at
BEFORE UPDATE ON campaigns
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_ad_sets_updated_at
BEFORE UPDATE ON ad_sets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_ads_updated_at
BEFORE UPDATE ON ads
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_rules_updated_at
BEFORE UPDATE ON rules
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_campaign_notes_updated_at
BEFORE UPDATE ON campaign_notes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
