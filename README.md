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

## Run Locally

```bash
npm install
cp .env.example .env
npm run dev
```

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
