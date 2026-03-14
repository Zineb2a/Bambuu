import { format, parseISO } from "date-fns";
import { supabase } from "../../lib/supabase";
import type { Transaction, TransactionInput } from "../types/transactions";

interface TransactionRow {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  category: string;
  occurred_on: string;
  type: "income" | "expense";
  is_recurring: boolean | null;
  recurring_frequency: "daily" | "weekly" | "monthly" | "yearly" | null;
  created_at: string;
}

const transactionSelect = `
  id,
  user_id,
  name,
  amount,
  category,
  occurred_on,
  type,
  is_recurring,
  recurring_frequency,
  created_at
`;

function mapTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    amount: Number(row.amount),
    category: row.category,
    occurredOn: row.occurred_on,
    type: row.type,
    isRecurring: Boolean(row.is_recurring),
    recurringFrequency: row.recurring_frequency,
    createdAt: row.created_at,
  };
}

export function formatTransactionDate(date: string) {
  return format(parseISO(date), "MMM d, yyyy");
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
    category: input.category,
    occurred_on: input.occurredOn,
    type: input.type,
    is_recurring: input.isRecurring ?? false,
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
    ...(updates.category !== undefined ? { category: updates.category } : {}),
    ...(updates.occurredOn !== undefined ? { occurred_on: updates.occurredOn } : {}),
    ...(updates.type !== undefined ? { type: updates.type } : {}),
    ...(updates.isRecurring !== undefined ? { is_recurring: updates.isRecurring } : {}),
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
