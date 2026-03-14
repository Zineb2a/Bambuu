import { supabase } from "../../lib/supabase";
import type {
  BudgetCategory,
  BudgetCategoryInput,
  SavingsGoal,
  SavingsGoalInput,
  Subscription,
  SubscriptionInput,
} from "../types/finance";

interface SavingsGoalRow {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  emoji: string;
  pinned: boolean;
  created_at: string;
}

interface BudgetCategoryRow {
  id: string;
  user_id: string;
  name: string;
  budget: number;
  icon: string;
  color: string;
  created_at: string;
}

interface SubscriptionRow {
  id: string;
  user_id: string;
  emoji: string;
  name: string;
  category: string;
  monthly_cost: number;
  renewal_date: string;
  has_student_discount: boolean;
  created_at: string;
}

const savingsGoalSelect = `
  id,
  user_id,
  name,
  target_amount,
  current_amount,
  emoji,
  pinned,
  created_at
`;

const budgetCategorySelect = `
  id,
  user_id,
  name,
  budget,
  icon,
  color,
  created_at
`;

const subscriptionSelect = `
  id,
  user_id,
  emoji,
  name,
  category,
  monthly_cost,
  renewal_date,
  has_student_discount,
  created_at
`;

function mapSavingsGoal(row: SavingsGoalRow): SavingsGoal {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    targetAmount: Number(row.target_amount),
    currentAmount: Number(row.current_amount),
    emoji: row.emoji,
    pinned: row.pinned,
    createdAt: row.created_at,
  };
}

function mapBudgetCategory(row: BudgetCategoryRow): BudgetCategory {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    budget: Number(row.budget),
    icon: row.icon,
    color: row.color,
    createdAt: row.created_at,
  };
}

function mapSubscription(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    userId: row.user_id,
    emoji: row.emoji,
    name: row.name,
    category: row.category,
    monthlyCost: Number(row.monthly_cost),
    renewalDate: row.renewal_date,
    hasStudentDiscount: row.has_student_discount,
    createdAt: row.created_at,
  };
}

export async function listSavingsGoals(userId: string) {
  const { data, error } = await supabase
    .from("savings_goals")
    .select(savingsGoalSelect)
    .eq("user_id", userId)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => mapSavingsGoal(row as SavingsGoalRow));
}

export async function createSavingsGoal(userId: string, input: SavingsGoalInput) {
  if (input.pinned) {
    await supabase.from("savings_goals").update({ pinned: false }).eq("user_id", userId);
  }

  const { data, error } = await supabase
    .from("savings_goals")
    .insert({
      user_id: userId,
      name: input.name,
      target_amount: input.targetAmount,
      current_amount: input.currentAmount,
      emoji: input.emoji,
      pinned: input.pinned ?? false,
    })
    .select(savingsGoalSelect)
    .single();

  if (error) throw error;
  return mapSavingsGoal(data as SavingsGoalRow);
}

export async function updateSavingsGoal(
  userId: string,
  goalId: string,
  updates: Partial<SavingsGoalInput>,
) {
  if (updates.pinned) {
    await supabase.from("savings_goals").update({ pinned: false }).eq("user_id", userId);
  }

  const payload = {
    ...(updates.name !== undefined ? { name: updates.name } : {}),
    ...(updates.targetAmount !== undefined ? { target_amount: updates.targetAmount } : {}),
    ...(updates.currentAmount !== undefined ? { current_amount: updates.currentAmount } : {}),
    ...(updates.emoji !== undefined ? { emoji: updates.emoji } : {}),
    ...(updates.pinned !== undefined ? { pinned: updates.pinned } : {}),
  };

  const { data, error } = await supabase
    .from("savings_goals")
    .update(payload)
    .eq("id", goalId)
    .eq("user_id", userId)
    .select(savingsGoalSelect)
    .single();

  if (error) throw error;
  return mapSavingsGoal(data as SavingsGoalRow);
}

export async function removeSavingsGoal(userId: string, goalId: string) {
  const { error } = await supabase
    .from("savings_goals")
    .delete()
    .eq("id", goalId)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function listBudgetCategories(userId: string) {
  const { data, error } = await supabase
    .from("budget_categories")
    .select(budgetCategorySelect)
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => mapBudgetCategory(row as BudgetCategoryRow));
}

export async function createBudgetCategory(userId: string, input: BudgetCategoryInput) {
  const { data, error } = await supabase
    .from("budget_categories")
    .insert({
      user_id: userId,
      name: input.name,
      budget: input.budget,
      icon: input.icon,
      color: input.color,
    })
    .select(budgetCategorySelect)
    .single();

  if (error) throw error;
  return mapBudgetCategory(data as BudgetCategoryRow);
}

export async function updateBudgetCategory(
  userId: string,
  categoryId: string,
  updates: Partial<BudgetCategoryInput>,
) {
  const payload = {
    ...(updates.name !== undefined ? { name: updates.name } : {}),
    ...(updates.budget !== undefined ? { budget: updates.budget } : {}),
    ...(updates.icon !== undefined ? { icon: updates.icon } : {}),
    ...(updates.color !== undefined ? { color: updates.color } : {}),
  };

  const { data, error } = await supabase
    .from("budget_categories")
    .update(payload)
    .eq("id", categoryId)
    .eq("user_id", userId)
    .select(budgetCategorySelect)
    .single();

  if (error) throw error;
  return mapBudgetCategory(data as BudgetCategoryRow);
}

export async function removeBudgetCategory(userId: string, categoryId: string) {
  const { error } = await supabase
    .from("budget_categories")
    .delete()
    .eq("id", categoryId)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function listSubscriptions(userId: string) {
  const { data, error } = await supabase
    .from("subscriptions")
    .select(subscriptionSelect)
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => mapSubscription(row as SubscriptionRow));
}

export async function createSubscription(userId: string, input: SubscriptionInput) {
  const { data, error } = await supabase
    .from("subscriptions")
    .insert({
      user_id: userId,
      emoji: input.emoji,
      name: input.name,
      category: input.category,
      monthly_cost: input.monthlyCost,
      renewal_date: input.renewalDate,
      has_student_discount: input.hasStudentDiscount,
    })
    .select(subscriptionSelect)
    .single();

  if (error) throw error;
  return mapSubscription(data as SubscriptionRow);
}

export async function updateSubscription(
  userId: string,
  subscriptionId: string,
  updates: Partial<SubscriptionInput>,
) {
  const payload = {
    ...(updates.emoji !== undefined ? { emoji: updates.emoji } : {}),
    ...(updates.name !== undefined ? { name: updates.name } : {}),
    ...(updates.category !== undefined ? { category: updates.category } : {}),
    ...(updates.monthlyCost !== undefined ? { monthly_cost: updates.monthlyCost } : {}),
    ...(updates.renewalDate !== undefined ? { renewal_date: updates.renewalDate } : {}),
    ...(updates.hasStudentDiscount !== undefined
      ? { has_student_discount: updates.hasStudentDiscount }
      : {}),
  };

  const { data, error } = await supabase
    .from("subscriptions")
    .update(payload)
    .eq("id", subscriptionId)
    .eq("user_id", userId)
    .select(subscriptionSelect)
    .single();

  if (error) throw error;
  return mapSubscription(data as SubscriptionRow);
}

export async function removeSubscription(userId: string, subscriptionId: string) {
  const { error } = await supabase
    .from("subscriptions")
    .delete()
    .eq("id", subscriptionId)
    .eq("user_id", userId);

  if (error) throw error;
}
