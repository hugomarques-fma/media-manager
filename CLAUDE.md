# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**media-manager** is a platform for intelligent Meta Ads campaign management with AI-powered suggestions. The project is in PRD stage (Março 2026, v1.0 MVP).

**Reference:** [PRD_media-manager.md](./PRD_media-manager.md)

---

## Technology Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Frontend** | Next.js (SSR) + TypeScript | React-based, server-side rendering for performance |
| **Styling** | Tailwind CSS + shadcn/ui | Component library for rapid UI development |
| **Backend** | Supabase Edge Functions (Deno) | Serverless, integrates with database |
| **Database** | Supabase (PostgreSQL) | Realtime, RLS, Auth, pg_cron for scheduling |
| **Authentication** | Supabase Auth + OAuth 2.0 (Meta) | Native auth + Facebook Login flow |
| **AI Agent** | OpenAI GPT or Claude API | Analysis and suggestion generation |
| **External API** | Meta Marketing API (v21+) | Campaign sync, metrics, execution |
| **Email** | Resend | Transactional emails for alerts/digest |
| **Charts** | Recharts or Chart.js | Data visualization in dashboard |

---

## Core Architecture

### 1. Three-Layer System

```
Frontend (Next.js)
  ↓
Edge Functions (Deno) + RLS
  ↓
Supabase PostgreSQL
  ↓
External: Meta API, AI Models
```

**Key principle:** No traditional backend server. All business logic lives in Edge Functions or frontend.

### 2. Multi-Tenant Data Model

Row Level Security (RLS) isolates data per user/workspace:
- Users can manage multiple `ad_accounts` (different Meta accounts)
- All queries filtered by `user_id` at database level
- Access tokens encrypted in `ad_accounts.access_token` column

### 3. Event-Driven Agent

AI suggestions are generated on a schedule (hourly via pg_cron):

```
pg_cron trigger (hourly)
  → Edge Function fetches campaign metrics
  → Formats context (JSON)
  → Calls OpenAI/Claude API
  → Persists suggestions to `ai_suggestions` table
  → Creates notification record
  → User approves/rejects in UI
  → Approved → executes via Meta API
  → Result logged to `action_logs`
```

### 4. Rules Engine

User-defined automation rules evaluated on schedule:
- Conditions: threshold-based metrics (CPA > X, ROAS < Y, etc.)
- Actions: pause/activate campaigns, adjust budgets, send notifications
- Two modes: **Suggestion** (requires approval) or **Automatic** (direct execution)
- Stored as JSONB in `rules.conditions` and `rules.actions` for flexibility

---

## Database Schema (Core Tables)

Only essential tables for MVP. Reference PRD section 6.2 for complete schema.

```sql
-- Users & Accounts
users (id, email, name, created_at)
ad_accounts (id, user_id, meta_account_id, name, access_token, status)

-- Campaign Hierarchy
campaigns (id, ad_account_id, meta_campaign_id, name, status, objective, daily_budget)
ad_sets (id, campaign_id, meta_adset_id, name, status, budget)
ads (id, ad_set_id, meta_ad_id, name, status, creative_url)

-- Metrics & History
campaign_metrics (id, campaign_id, date, spend, impressions, clicks, ctr, cpc, conversions, cpa, roas)

-- AI & Rules
ai_suggestions (id, account_id, type, scope, description, reasoning, status, created_at, resolved_at)
rules (id, user_id, name, scope, conditions JSONB, actions JSONB, frequency, mode, status)

-- Audit & Notifications
action_logs (id, user_id, suggestion_id, rule_id, action_type, entity_id, before_state, after_state, executed_at, status)
notifications (id, user_id, type, message, read, created_at)
campaign_notes (id, campaign_id, user_id, content, created_at)
```

**RLS Policy:** Every row query filtered by `user_id` at database level. No exceptions.

---

## Folder Structure (Expected)

```
media-manager/
├── docs/
│   ├── PRD_media-manager.md
│   ├── stories/          # AIOS story files (numbered)
│   └── architecture/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   │   ├── dashboard/    # Dashboard-specific components
│   │   ├── auth/         # Auth flows
│   │   └── ui/           # shadcn/ui wrappers
│   ├── hooks/            # Custom React hooks
│   ├── lib/
│   │   ├── supabase.ts   # Supabase client config
│   │   ├── meta-api.ts   # Meta API integration
│   │   └── ai-agent.ts   # AI model integration
│   └── types/            # TypeScript types
├── supabase/
│   ├── migrations/       # SQL migrations (numbered)
│   ├── functions/        # Edge Functions (Deno)
│   └── policies/         # RLS policies
├── tests/                # Jest/Vitest tests
├── .env.local            # Local environment (gitignored)
├── next.config.js
├── tsconfig.json
└── package.json
```

---

## Key Development Workflows

### Starting Implementation

1. **Setup Phase:**
   - Initialize Next.js project with TypeScript
   - Configure Supabase client and Edge Functions
   - Setup authentication flow (Supabase Auth + Meta OAuth)
   - Create initial database schema via migrations

2. **Core Feature Development** (Story-driven per AIOS):
   - Read story acceptance criteria
   - Implement feature incrementally
   - Update story checklist as tasks complete
   - Run tests and lint before marking complete

3. **Testing Strategy:**
   - Unit tests: React components, utility functions, AI prompt engineering
   - Integration tests: Edge Functions + Supabase
   - E2E: Critical paths (OAuth flow, suggestion approval, rule execution)

### Common Commands (Once Project Initialized)

```bash
# Development
npm run dev              # Next.js dev server (localhost:3000)
npm run supabase-local  # Supabase local environment

# Testing
npm test                # Run Jest/Vitest
npm run test:watch     # Watch mode
npm run test:e2e       # Playwright/Cypress E2E

# Code Quality
npm run lint           # ESLint + TypeScript check
npm run format         # Prettier formatting
npm run type-check     # TypeScript compilation check

# Database
npm run db:push        # Push migrations to Supabase
npm run db:seed        # Seed test data
npm run db:reset       # Reset local database

# Deployment
npm run build          # Next.js production build
vercel deploy          # Deploy to Vercel (or similar)
```

---

## Critical Implementation Patterns

### 1. Meta API Integration (`src/lib/meta-api.ts`)

**Token Management:**
- Store access tokens encrypted in Supabase
- Refresh tokens before expiration (check Meta API docs for TTL)
- Implement retry with exponential backoff for rate limits

**Data Sync:**
- Fetch campaigns, ad sets, ads, and daily metrics via Meta Marketing API
- Store metrics in `campaign_metrics` table with date granularity
- Log sync status in `action_logs` for debugging

**Execution:**
- Approved suggestions → call Meta API to pause/activate/adjust budget
- Wrap in try-catch and log result (success/failure) to `action_logs`

### 2. AI Agent Orchestration (`src/lib/ai-agent.ts`)

**Suggestion Generation:**
```typescript
// Fetch campaign context from Supabase
const context = await getCampaignContext(accountId);

// Call AI model with structured prompt
const prompt = buildAgentPrompt(context);
const suggestions = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: prompt }],
});

// Parse response and store in ai_suggestions table
await persistSuggestions(accountId, suggestions);
```

**Prompt Design:**
- Include campaign metrics (last 7 days, 30 days)
- Reference historical performance for pattern detection
- Clearly explain reasoning for each suggestion
- Include estimated impact (% improvement potential)

### 3. Rules Engine (`src/lib/rules-engine.ts`)

**Evaluation:**
```typescript
// Fetch active rules for account
const rules = await getRulesForAccount(accountId);

// Evaluate each rule against current metrics
for (const rule of rules) {
  const conditionsMet = evaluateConditions(rule.conditions, currentMetrics);
  if (conditionsMet) {
    if (rule.mode === "automatic") {
      // Execute immediately
      await executeActions(rule.actions, accountId);
    } else {
      // Create suggestion for approval
      await createRuleSuggestion(rule, accountId);
    }
  }
}
```

**Condition Evaluation:**
- Parse JSONB conditions: `{ metric: "CPA", operator: ">", value: 50, period: "7d" }`
- Support boolean logic: AND, OR between condition groups
- Timestamp-aware: "last 7 days", "month-to-date", etc.

### 4. Dashboard Data Fetching (`src/app/dashboard/page.tsx`)

**Performance Considerations:**
- Use Supabase RLS filters to load only user's data
- Fetch metrics for selected period (not all historical data)
- Implement pagination for campaign table (50 rows default)
- Cache KPI cards for 5 minutes if possible
- Separate queries for charts (avoid N+1)

**Filter State Management:**
- URL query params for filters (period, account, campaign, status, comparison)
- Enables shareable URLs and browser back/forward
- Example: `/dashboard?period=last-7-days&account=123&campaign=456`

---

## Security & Compliance

### Data Protection

- **Token Encryption:** Meta access tokens encrypted with AES-256 at rest
- **RLS Mandatory:** Every Supabase query must pass `user_id` check (database-enforced)
- **Audit Trail:** Every action logged to `action_logs` with before/after state
- **No Shared State:** Workspaces completely isolated (multi-tenant via RLS)

### API Security

- **Rate Limiting:** Implement backoff for Meta API rate limits (429 responses)
- **Error Handling:** Never expose raw API errors to frontend; wrap in user-friendly messages
- **Validation:** Validate all user input before passing to Meta API or AI models

---

## Testing Requirements

**Per Story Definition:**
- [ ] Unit tests for new functions (Jest/Vitest)
- [ ] Integration tests for database operations
- [ ] E2E tests for critical user flows (OAuth, approval workflow)
- [ ] RLS tests to verify data isolation

**Pre-Commit:**
```bash
npm run lint && npm run type-check && npm test
```

**All Tests Must Pass** before marking story task complete.

---

## When to Use AIOS Commands

This project follows **Synkra AIOS** development framework. Key patterns:

1. **Stories:** All features start with a numbered story in `docs/stories/`
   - Format: `{epicNum}.{storyNum}.story.md`
   - Update checkboxes as tasks complete

2. **Agent Activation:**
   - `@dev` — Implementation work
   - `@qa` — Testing and quality gates
   - `@architect` — Design decisions
   - `@po` — Story validation
   - `@sm` — Story creation

3. **Commands:**
   ```
   *create-story  — Create new story from epic
   *develop-story — Start implementation of story
   *qa-gate       — Quality review of completed story
   *help          — Show available agent commands
   ```

4. **Story Lifecycle:**
   - Draft (created by @sm) → Validated by @po → Implemented by @dev → Tested by @qa → Done

---

## Documentation

- **PRD:** [PRD_media-manager.md](./PRD_media-manager.md) — Complete product spec
- **Architecture Docs:** Create `docs/architecture/` with decision records
- **API Docs:** Document Supabase Edge Function endpoints
- **Schema Docs:** Keep `docs/database/` schema reference updated

---

## Performance Targets (Non-Functional Requirements)

| Target | Metric |
|--------|--------|
| Dashboard Load | < 3 seconds (P95) for 50 campaigns |
| AI Suggestion Generation | < 30 seconds (includes API calls) |
| Rule Evaluation | < 10 seconds for 100+ rules |
| Meta API Sync | Async, non-blocking; retry on failure |
| DB Query Latency | < 200ms (P95) for typical dashboard query |

---

## Useful References

- **Supabase Docs:** https://supabase.com/docs
- **Meta Marketing API:** https://developers.facebook.com/docs/marketing-apis
- **Next.js App Router:** https://nextjs.org/docs/app
- **shadcn/ui:** https://ui.shadcn.com
- **TypeScript:** https://www.typescriptlang.org/docs/

---

## Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| RLS policy blocking queries | Check `authenticated` role in Supabase dashboard; verify `user_id` in WHERE clause |
| Meta API 401 errors | Access token expired; check `ad_accounts.access_token` and refresh if needed |
| Edge Function timeouts | Break into smaller functions; async queries must complete within 60s |
| Dashboard slow | Check query N+1 problems; use `select()` to limit columns fetched |
| Tests failing on CI/CD | Ensure `.env.test` or CI secrets are configured; Supabase may require different region |

