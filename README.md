# Bambuu

Bambuu is a student-first personal finance app built for hackathon demos. It helps users track income and expenses, manage recurring transactions, set savings goals, watch subscriptions, and understand their money through a cleaner, more guided experience than a generic budgeting spreadsheet.

## Why Bambuu

Students often manage money across part-time jobs, scholarships, allowances, subscriptions, and irregular spending, but most finance tools are built for full-time salaried users. Bambuu is designed around that reality:

- recurring income and expenses, including `biweekly` income
- goal-based saving with pinned priorities
- budget category tracking
- subscription visibility
- analytics and trend views
- student discount detection opportunities
- bilingual support in English and French

## What It Does

- `Home`: balance overview, income vs expenses, charts, pinned savings goal
- `Transactions`: searchable ledger with filters, exports, and recurring transaction visibility
- `Recurring Transactions`: create, edit, pause, resume, and delete recurring entries
- `Budget & Goals`: manage savings goals, contributions, and budget categories
- `Income` / `Expenses`: focused views by transaction type
- `Subscriptions`: track monthly services and surface discount opportunities
- `Analytics`: spending trends, savings rate, budget comparisons, category analysis
- `Investments`: educational portfolio tracking experience
- `Settings`: user preferences including language, currency, and notifications

## Hackathon Highlights

- Real auth and persistence with Supabase
- Row-level security policies for per-user data isolation
- Recurring transaction support including `daily`, `weekly`, `biweekly`, `monthly`, and `yearly`
- Multi-currency support with original and display values
- Student discount detection pipeline using shared detector logic and Supabase Edge Functions fallback
- Notification system for income, budgets, goals, and subscriptions
- Mobile-friendly React app with a polished dashboard-style UI

## Tech Stack

- `React`
- `TypeScript`
- `Vite`
- `React Router`
- `Supabase Auth`
- `Supabase Postgres`
- `Supabase Edge Functions`
- `Recharts`
- `Tailwind CSS`
- `date-fns`

## Project Structure

```text
src/
  app/
    pages/           Main product screens
    components/      Reusable UI and feature components
    lib/             Data access, currency, notifications, finance logic
    providers/       Auth and i18n providers
    types/           Shared app types
  lib/
    supabase.ts      Supabase client setup

supabase/
  schema.sql         Database schema, policies, triggers
  functions/server/  Edge function code
```

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a local env file from the example:

```bash
cp .env.example .env
```

This app uses Vite, so client env vars must start with `VITE_`.

Required values:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 3. Set up Supabase

1. Create or open a Supabase project.
2. Run the SQL in [supabase/schema.sql](/Users/zineb/Documents/GitHub/Bambu/supabase/schema.sql).
3. Make sure the `transactions` table and policies are created.
4. For smoother local testing, you can disable email confirmation in Supabase Auth.

### 4. Start the app

```bash
npm run dev
```

### 5. Production build

```bash
npm run build
```

## Demo Flow

If you are presenting Bambuu in a hackathon demo, this is the fastest walkthrough:

1. Sign up or log in with Supabase Auth.
2. Add an income transaction and mark it recurring.
3. Add a `biweekly` recurring income to show non-monthly pay cycles.
4. Add a spending category and a savings goal.
5. Pin a goal and show it on the home dashboard.
6. Open analytics to show spending vs income trends.
7. Open subscriptions to show recurring service tracking and student discount opportunities.

## Data Model Notes

The app persists:

- profiles
- transactions
- savings goals
- goal contributions
- budget categories
- subscriptions
- investments
- user settings
- linked cards
- notifications

The schema also includes:

- auth trigger for provisioning profile and settings on sign-up
- row-level security for all user-owned tables
- recurring transaction fields on `transactions`

## Known Constraints

- This is a hackathon-style product, so some advanced financial calculations are simplified.
- External bank syncing is not enabled yet.
- Student discount detection depends on the bundled detector logic and serverless integration path.

## Why This Is Demo-Ready

- Clear problem and target audience
- Real authentication and persistence
- Multiple product surfaces beyond a single dashboard
- Strong feature story around recurring student income, subscriptions, and saving goals
- Enough backend structure to feel like a real product, not just a UI mock

## Team Notes

If you continue building this after the hackathon, the next strong improvements would be:

- transaction recurrence generation on the backend
- better migration management for Supabase schema changes
- automated tests for finance calculations
- richer recurring rules and reminders
- stronger CSV/import workflows

