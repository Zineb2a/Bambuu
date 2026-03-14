export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  emoji: string;
  pinned: boolean;
  createdAt: string;
}

export interface SavingsGoalInput {
  name: string;
  targetAmount: number;
  currentAmount: number;
  emoji: string;
  pinned?: boolean;
}

export interface BudgetCategory {
  id: string;
  userId: string;
  name: string;
  budget: number;
  icon: string;
  color: string;
  createdAt: string;
}

export interface BudgetCategoryInput {
  name: string;
  budget: number;
  icon: string;
  color: string;
}

export interface Subscription {
  id: string;
  userId: string;
  emoji: string;
  name: string;
  category: string;
  monthlyCost: number;
  renewalDate: string;
  hasStudentDiscount: boolean;
  createdAt: string;
}

export interface SubscriptionInput {
  emoji: string;
  name: string;
  category: string;
  monthlyCost: number;
  renewalDate: string;
  hasStudentDiscount: boolean;
}
