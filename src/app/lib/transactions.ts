import { format, parseISO } from "date-fns";
import { supabase } from "../../lib/supabase";
import { convertCurrency } from "./currency";
import type { Transaction, TransactionInput } from "../types/transactions";

interface TransactionRow {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  currency: string | null;
  original_amount: number | null;
  category: string;
  occurred_on: string;
  type: "income" | "expense";
  is_recurring: boolean | null;
  recurring_active: boolean | null;
  recurring_frequency: "daily" | "weekly" | "monthly" | "yearly" | null;
  created_at: string;
}

const transactionSelect = `
  id,
  user_id,
  name,
  amount,
  currency,
  original_amount,
  category,
  occurred_on,
  type,
  is_recurring,
  recurring_active,
  recurring_frequency,
  created_at
`;

function mapTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    amount: Number(row.amount),
    currency: row.currency ?? "USD",
    originalAmount: Number(row.original_amount ?? row.amount),
    category: row.category,
    occurredOn: row.occurred_on,
    type: row.type,
    isRecurring: Boolean(row.is_recurring),
    recurringActive: row.recurring_active ?? true,
    recurringFrequency: row.recurring_frequency,
    createdAt: row.created_at,
  };
}

export function formatTransactionDate(date: string) {
  return format(parseISO(date), "MMM d, yyyy");
}

export function parseTransactionDate(date: string) {
  return parseISO(date);
}

export function getTransactionAmountInCurrency(transaction: Transaction, currency: string) {
  return convertCurrency(transaction.originalAmount, transaction.currency, currency);
}

export async function listTransactions(userId: string) {
  const { data, error } = await supabase
    .from("transactions")
    .select(transactionSelect)
    .eq("user_id", userId)
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapTransaction(row as TransactionRow));
}

export async function createTransaction(userId: string, input: TransactionInput) {
  const payload = {
    user_id: userId,
    name: input.name,
    amount: input.amount,
    currency: input.currency ?? "USD",
    original_amount: input.originalAmount ?? input.amount,
    category: input.category,
    occurred_on: input.occurredOn,
    type: input.type,
    is_recurring: input.isRecurring ?? false,
    recurring_active: input.recurringActive ?? true,
    recurring_frequency: input.isRecurring ? input.recurringFrequency ?? "monthly" : null,
  };

  const { data, error } = await supabase
    .from("transactions")
    .insert(payload)
    .select(transactionSelect)
    .single();

  if (error) {
    throw error;
  }

  return mapTransaction(data as TransactionRow);
}

export async function updateTransaction(
  userId: string,
  transactionId: string,
  updates: Partial<TransactionInput>,
) {
  const payload = {
    ...(updates.name !== undefined ? { name: updates.name } : {}),
    ...(updates.amount !== undefined ? { amount: updates.amount } : {}),
    ...(updates.currency !== undefined ? { currency: updates.currency } : {}),
    ...(updates.originalAmount !== undefined ? { original_amount: updates.originalAmount } : {}),
    ...(updates.category !== undefined ? { category: updates.category } : {}),
    ...(updates.occurredOn !== undefined ? { occurred_on: updates.occurredOn } : {}),
    ...(updates.type !== undefined ? { type: updates.type } : {}),
    ...(updates.isRecurring !== undefined ? { is_recurring: updates.isRecurring } : {}),
    ...(updates.recurringActive !== undefined ? { recurring_active: updates.recurringActive } : {}),
    ...(updates.recurringFrequency !== undefined
      ? { recurring_frequency: updates.recurringFrequency }
      : {}),
  };

  const { data, error } = await supabase
    .from("transactions")
    .update(payload)
    .eq("id", transactionId)
    .eq("user_id", userId)
    .select(transactionSelect)
    .single();

  if (error) {
    throw error;
  }

  return mapTransaction(data as TransactionRow);
}

export async function removeTransaction(userId: string, transactionId: string) {
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", transactionId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}
