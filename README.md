# Bambuu

Bambuu is a student-focused personal finance app built for users with irregular income, recurring subscriptions, and short-term savings goals.

Unlike traditional budgeting tools built around fixed monthly salaries, Bambuu is designed for part-time jobs, scholarships, allowances, and real student spending behavior.

## What Bambuu Offers

- transaction tracking for income and expenses
- recurring transactions, including `biweekly` income
- savings goals with pinned priorities
- budget category tracking
- subscription management
- analytics and spending trends
- student discount opportunity detection
- English and French support

## Why It Matters

Bambuu helps users answer the questions that matter most:

- How much money is actually coming in?
- What recurring payments are draining cash?
- Am I staying within budget?
- What am I saving toward?
- Where can I reduce costs?

This makes Bambuu more than an expense tracker. It is a practical money management product for a segment that is often underserved by traditional finance apps.

## Stack

- `React`
- `TypeScript`
- `Vite`
- `Supabase`
- `Tailwind CSS`
- `Recharts`

## Check it out here!!
Bambuu: https://bambuu.me/

## Run Locally

```bash
npm install
cp .env.example .env
npm run dev
```

## GitHub Pages

This repo can be deployed to GitHub Pages as a static frontend. The included workflow is at [.github/workflows/deploy-pages.yml](/Users/zineb/Documents/GitHub/Bambu/.github/workflows/deploy-pages.yml).

Set these repository secrets before deploying:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL` (optional, only if you host the Plaid backend elsewhere)

If `VITE_API_BASE_URL` is not set, the app still deploys, but Plaid bank-linking features are disabled on GitHub Pages.

## Supabase Setup

1. Create or open a Supabase project.
2. Run [supabase/schema.sql](/Users/zineb/Documents/GitHub/Bambu/supabase/schema.sql).
3. Set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## Product Scope

Bambuu currently includes:

- authentication
- transactions
- recurring income and expenses
- savings goals and contributions
- budget categories
- subscriptions
- notifications
- analytics
- settings

## Summary

Bambuu is a cleaner, more relevant finance experience for students and early-career users managing inconsistent income, recurring costs, and savings goals.
