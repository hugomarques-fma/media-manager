-- Seed data for Media Manager
-- Insert sample data for testing and demonstration

-- Clear existing data (cascade deletes)
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE audit_events CASCADE;
TRUNCATE TABLE action_logs CASCADE;
TRUNCATE TABLE ai_suggestions CASCADE;
TRUNCATE TABLE campaign_metrics CASCADE;
TRUNCATE TABLE ads CASCADE;
TRUNCATE TABLE ad_sets CASCADE;
TRUNCATE TABLE campaigns CASCADE;
TRUNCATE TABLE ad_accounts CASCADE;

-- Insert sample ad accounts
INSERT INTO ad_accounts (
  id,
  user_id,
  meta_account_id,
  name,
  status,
  access_token,
  refresh_token,
  token_expires_at,
  created_at,
  updated_at
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  (SELECT id FROM auth.users LIMIT 1),
  '123456789',
  'E-Commerce Store - US',
  'connected',
  'mock_access_token_12345',
  'mock_refresh_token_12345',
  NOW() + INTERVAL '30 days',
  NOW(),
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  (SELECT id FROM auth.users LIMIT 1),
  '987654321',
  'SaaS Product - Global',
  'connected',
  'mock_access_token_67890',
  'mock_refresh_token_67890',
  NOW() + INTERVAL '30 days',
  NOW(),
  NOW()
);

-- Insert sample campaigns
INSERT INTO campaigns (
  id,
  ad_account_id,
  meta_campaign_id,
  name,
  status,
  objective,
  daily_budget,
  created_at,
  updated_at
) VALUES
(
  '660e8400-e29b-41d4-a716-446655440000'::uuid,
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  'campaign_001',
  'Summer Sale - Conversions',
  'active',
  'CONVERSIONS',
  5000.00,
  NOW(),
  NOW()
),
(
  '660e8400-e29b-41d4-a716-446655440001'::uuid,
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  'campaign_002',
  'Brand Awareness - Reach',
  'active',
  'REACH',
  3000.00,
  NOW(),
  NOW()
),
(
  '660e8400-e29b-41d4-a716-446655440002'::uuid,
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'campaign_003',
  'Free Trial Signup - Leads',
  'paused',
  'LEAD_GENERATION',
  2000.00,
  NOW(),
  NOW()
);

-- Insert sample ad sets
INSERT INTO ad_sets (
  id,
  campaign_id,
  meta_adset_id,
  name,
  status,
  budget,
  created_at,
  updated_at
) VALUES
(
  '770e8400-e29b-41d4-a716-446655440000'::uuid,
  '660e8400-e29b-41d4-a716-446655440000'::uuid,
  'adset_001',
  'Summer Sale - Age 18-35',
  'active',
  2500.00,
  NOW(),
  NOW()
),
(
  '770e8400-e29b-41d4-a716-446655440001'::uuid,
  '660e8400-e29b-41d4-a716-446655440000'::uuid,
  'adset_002',
  'Summer Sale - Age 35-55',
  'active',
  2500.00,
  NOW(),
  NOW()
),
(
  '770e8400-e29b-41d4-a716-446655440002'::uuid,
  '660e8400-e29b-41d4-a716-446655440001'::uuid,
  'adset_003',
  'Brand Awareness - Desktop',
  'active',
  3000.00,
  NOW(),
  NOW()
);

-- Insert sample ads
INSERT INTO ads (
  id,
  ad_set_id,
  meta_ad_id,
  name,
  status,
  created_at,
  updated_at
) VALUES
(
  '880e8400-e29b-41d4-a716-446655440000'::uuid,
  '770e8400-e29b-41d4-a716-446655440000'::uuid,
  'ad_001',
  'Summer Sale - Creative A',
  'active',
  NOW(),
  NOW()
),
(
  '880e8400-e29b-41d4-a716-446655440001'::uuid,
  '770e8400-e29b-41d4-a716-446655440000'::uuid,
  'ad_002',
  'Summer Sale - Creative B',
  'active',
  NOW(),
  NOW()
),
(
  '880e8400-e29b-41d4-a716-446655440002'::uuid,
  '770e8400-e29b-41d4-a716-446655440001'::uuid,
  'ad_003',
  'Summer Sale - Creative C (Age 35+)',
  'paused',
  NOW(),
  NOW()
);

-- Insert sample campaign metrics
INSERT INTO campaign_metrics (
  id,
  campaign_id,
  date,
  spend,
  impressions,
  clicks,
  ctr,
  cpc,
  cpm,
  conversions,
  cpa,
  roas,
  created_at,
  updated_at
) VALUES
(
  '990e8400-e29b-41d4-a716-446655440000'::uuid,
  '660e8400-e29b-41d4-a716-446655440000'::uuid,
  (CURRENT_DATE - INTERVAL '3 days')::date,
  1250.50,
  45000,
  1800,
  4.0,
  0.69,
  27.78,
  180,
  6.95,
  2.40,
  NOW(),
  NOW()
),
(
  '990e8400-e29b-41d4-a716-446655440001'::uuid,
  '660e8400-e29b-41d4-a716-446655440000'::uuid,
  (CURRENT_DATE - INTERVAL '2 days')::date,
  1320.75,
  48500,
  1950,
  4.02,
  0.68,
  27.23,
  210,
  6.29,
  2.65,
  NOW(),
  NOW()
),
(
  '990e8400-e29b-41d4-a716-446655440002'::uuid,
  '660e8400-e29b-41d4-a716-446655440000'::uuid,
  (CURRENT_DATE - INTERVAL '1 day')::date,
  1400.00,
  52000,
  2100,
  4.04,
  0.67,
  26.92,
  235,
  5.96,
  2.82,
  NOW(),
  NOW()
),
(
  '990e8400-e29b-41d4-a716-446655440003'::uuid,
  '660e8400-e29b-41d4-a716-446655440001'::uuid,
  (CURRENT_DATE - INTERVAL '3 days')::date,
  900.00,
  35000,
  700,
  2.0,
  1.29,
  25.71,
  42,
  21.43,
  0.95,
  NOW(),
  NOW()
),
(
  '990e8400-e29b-41d4-a716-446655440004'::uuid,
  '660e8400-e29b-41d4-a716-446655440001'::uuid,
  (CURRENT_DATE - INTERVAL '2 days')::date,
  920.00,
  36000,
  720,
  2.0,
  1.28,
  25.56,
  48,
  19.17,
  1.12,
  NOW(),
  NOW()
),
(
  '990e8400-e29b-41d4-a716-446655440005'::uuid,
  '660e8400-e29b-41d4-a716-446655440001'::uuid,
  (CURRENT_DATE - INTERVAL '1 day')::date,
  950.00,
  37500,
  750,
  2.0,
  1.27,
  25.33,
  55,
  17.27,
  1.28,
  NOW(),
  NOW()
);

-- Insert sample notifications
INSERT INTO notifications (
  id,
  account_id,
  user_id,
  type,
  priority,
  title,
  message,
  read,
  created_at,
  updated_at
) VALUES
(
  'a90e8400-e29b-41d4-a716-446655440000'::uuid,
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  (SELECT id FROM auth.users LIMIT 1),
  'campaign_performance',
  'high',
  'Campaign ROAS Alert',
  'Summer Sale campaign ROAS exceeded 2.5x threshold',
  false,
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '2 hours'
),
(
  'a90e8400-e29b-41d4-a716-446655440001'::uuid,
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  (SELECT id FROM auth.users LIMIT 1),
  'budget_alert',
  'medium',
  'Daily Budget Update',
  'Summer Sale campaign spent $1,400 today (28% of daily budget)',
  true,
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
),
(
  'a90e8400-e29b-41d4-a716-446655440002'::uuid,
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  (SELECT id FROM auth.users LIMIT 1),
  'suggestion',
  'medium',
  'AI Suggestion Available',
  'New optimization suggestions available for your campaigns',
  false,
  NOW() - INTERVAL '3 hours',
  NOW() - INTERVAL '3 hours'
);

-- Insert sample AI suggestions
INSERT INTO ai_suggestions (
  id,
  account_id,
  campaign_id,
  type,
  title,
  description,
  recommendation,
  estimated_impact,
  confidence_score,
  priority,
  status,
  action_type,
  action_params,
  created_at,
  updated_at
) VALUES
(
  'b90e8400-e29b-41d4-a716-446655440000'::uuid,
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  '660e8400-e29b-41d4-a716-446655440000'::uuid,
  'budget_increase',
  'Increase Daily Budget - High Performer',
  'Summer Sale campaign has strong ROAS of 2.82x. Increasing budget could scale this success.',
  'Increase daily budget by 20-30% to capitalize on good performance.',
  '{"metric": "conversions", "change_percentage": 25}',
  0.85,
  'high',
  'pending',
  'update_budget',
  '{"increase_percentage": 25}',
  NOW(),
  NOW()
),
(
  'b90e8400-e29b-41d4-a716-446655440001'::uuid,
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  '660e8400-e29b-41d4-a716-446655440001'::uuid,
  'pause',
  'Pause Low-ROAS Campaign',
  'Brand Awareness campaign has poor ROAS of 1.28x despite spending $950.',
  'Consider pausing this campaign and reallocating budget to better performers.',
  '{"metric": "spend_efficiency", "change_percentage": -100}',
  0.75,
  'high',
  'pending',
  'pause_campaign',
  null,
  NOW(),
  NOW()
),
(
  'b90e8400-e29b-41d4-a716-446655440002'::uuid,
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  '660e8400-e29b-41d4-a716-446655440000'::uuid,
  'creative',
  'Test New Creatives - High CTR',
  'Summer Sale campaign has high CTR of 4.04%. Testing new creatives could further improve performance.',
  'Launch A/B test with new creative variations. Focus on headlines and visuals.',
  '{"metric": "ctr", "change_percentage": 30}',
  0.70,
  'medium',
  'pending',
  null,
  null,
  NOW(),
  NOW()
);

-- Insert sample audit events
INSERT INTO audit_events (
  id,
  account_id,
  user_id,
  entity_type,
  entity_id,
  event_type,
  changes,
  metadata,
  timestamp,
  created_at
) VALUES
(
  'c90e8400-e29b-41d4-a716-446655440000'::uuid,
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  (SELECT id FROM auth.users LIMIT 1),
  'campaign',
  '660e8400-e29b-41d4-a716-446655440000',
  'updated',
  '{"daily_budget": {"from": 4500, "to": 5000}}',
  '{"reason": "Performance optimization"}',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
),
(
  'c90e8400-e29b-41d4-a716-446655440001'::uuid,
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  (SELECT id FROM auth.users LIMIT 1),
  'ad_set',
  '770e8400-e29b-41d4-a716-446655440000',
  'created',
  '{}',
  '{"source": "manual_creation"}',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
),
(
  'c90e8400-e29b-41d4-a716-446655440002'::uuid,
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  (SELECT id FROM auth.users LIMIT 1),
  'campaign',
  '660e8400-e29b-41d4-a716-446655440002',
  'paused',
  '{"status": {"from": "active", "to": "paused"}}',
  '{"reason": "Low performance"}',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days'
);

-- Insert sample action logs
INSERT INTO action_logs (
  id,
  account_id,
  user_id,
  action_type,
  status,
  metadata,
  created_at,
  completed_at,
  updated_at
) VALUES
(
  'd90e8400-e29b-41d4-a716-446655440000'::uuid,
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  (SELECT id FROM auth.users LIMIT 1),
  'budget_update',
  'completed',
  '{"campaign_id": "660e8400-e29b-41d4-a716-446655440000", "old_budget": 4500, "new_budget": 5000}',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '23 hours',
  NOW() - INTERVAL '23 hours'
),
(
  'd90e8400-e29b-41d4-a716-446655440001'::uuid,
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  (SELECT id FROM auth.users LIMIT 1),
  'token_refresh',
  'completed',
  '{"account_id": "550e8400-e29b-41d4-a716-446655440000"}',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
),
(
  'd90e8400-e29b-41d4-a716-446655440002'::uuid,
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  (SELECT id FROM auth.users LIMIT 1),
  'campaign_pause',
  'completed',
  '{"campaign_id": "660e8400-e29b-41d4-a716-446655440002"}',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '4 days 20 hours',
  NOW() - INTERVAL '4 days 20 hours'
);

-- Insert sample scheduled reports
INSERT INTO scheduled_reports (
  id,
  account_id,
  name,
  type,
  frequency,
  scheduled_time,
  recipients,
  enabled,
  last_run_at,
  created_at,
  updated_at
) VALUES
(
  'e90e8400-e29b-41d4-a716-446655440000'::uuid,
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  'Daily Performance Report',
  'performance',
  'daily',
  '09:00',
  ARRAY[(SELECT email FROM auth.users LIMIT 1)],
  true,
  NOW() - INTERVAL '1 day',
  NOW(),
  NOW()
),
(
  'e90e8400-e29b-41d4-a716-446655440001'::uuid,
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  'Weekly Budget Summary',
  'budget',
  'weekly',
  '08:00',
  ARRAY[(SELECT email FROM auth.users LIMIT 1)],
  true,
  NOW() - INTERVAL '7 days',
  NOW(),
  NOW()
);

-- Grant RLS policies
ALTER TABLE ad_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_reports ENABLE ROW LEVEL SECURITY;
