import { useEffect, useMemo, useState } from "react";
import {
  Target,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  DollarSign,
  Tag,
  Utensils,
  Book,
  Bus,
  Film,
  ShoppingCart,
  Coffee,
  Home as HomeIcon,
  Music,
  Smartphone,
  Heart,
  Pin,
  PinOff,
} from "lucide-react";
import { endOfMonth, isWithinInterval, startOfMonth } from "date-fns";
import Layout from "../components/Layout";
import { useUserCurrency } from "../hooks/useUserCurrency";
import { formatCurrency } from "../lib/currency";
import {
  createBudgetCategory,
  createSavingsGoal,
  getBudgetAmountInCurrency,
  getSavingsGoalAmountsInCurrency,
  listBudgetCategories,
  listSavingsGoals,
  removeBudgetCategory,
  removeSavingsGoal,
  updateBudgetCategory,
  updateSavingsGoal,
} from "../lib/finance";
import { getTransactionAmountInCurrency, listTransactions, parseTransactionDate } from "../lib/transactions";
import { useAuth } from "../providers/AuthProvider";
import type { BudgetCategory, SavingsGoal } from "../types/finance";
import type { Transaction } from "../types/transactions";

const iconOptions = [
  { value: "utensils", label: "Food", icon: Utensils },
  { value: "book", label: "Books", icon: Book },
  { value: "bus", label: "Transport", icon: Bus },
  { value: "film", label: "Entertainment", icon: Film },
  { value: "shopping", label: "Shopping", icon: ShoppingCart },
  { value: "coffee", label: "Coffee", icon: Coffee },
  { value: "home", label: "Home", icon: HomeIcon },
  { value: "music", label: "Music", icon: Music },
  { value: "smartphone", label: "Smartphone", icon: Smartphone },
  { value: "heart", label: "Heart", icon: Heart },
];

const colorOptions = [
  "#2d6a4f",
  "#52b788",
  "#74c69d",
  "#95d5b2",
  "#b7e4c7",
  "#40916c",
  "#1b4332",
  "#081c15",
  "#52796f",
  "#84a98c",
];

const emojiOptions = ["💻", "📱", "🎮", "🚗", "✈️", "🏠", "🎓", "💍", "🎸", "📷", "🚲", "⌚", "🎯", "💰"];

interface BudgetCategoryWithSpent extends BudgetCategory {
  spent: number;
  displayBudget: number;
}

export default function BudgetGoals() {
  const { user } = useAuth();
  const currency = useUserCurrency();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [goalName, setGoalName] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [goalCurrent, setGoalCurrent] = useState("");
  const [goalEmoji, setGoalEmoji] = useState("💻");
  const [addingGoal, setAddingGoal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editBudget, setEditBudget] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryBudget, setNewCategoryBudget] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("shopping");
  const [newCategoryColor, setNewCategoryColor] = useState("#DDEB9D");

  useEffect(() => {
    if (!user) {
      setGoals([]);
      setCategories([]);
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);

      try {
        const [goalData, categoryData, transactionData] = await Promise.all([
          listSavingsGoals(user.id),
          listBudgetCategories(user.id),
          listTransactions(user.id),
        ]);

        if (!isMounted) {
          return;
        }

        setGoals(goalData);
        setCategories(categoryData);
        setTransactions(transactionData);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    const reload = () => {
      loadData();
    };

    window.addEventListener("transactionsChanged", reload);
    window.addEventListener("financialDataChanged", reload);

    return () => {
      isMounted = false;
      window.removeEventListener("transactionsChanged", reload);
      window.removeEventListener("financialDataChanged", reload);
    };
  }, [user]);

  const categoriesWithSpent = useMemo<BudgetCategoryWithSpent[]>(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    const monthlyExpenses = transactions.filter(
      (transaction) =>
        transaction.type === "expense" &&
        isWithinInterval(parseTransactionDate(transaction.occurredOn), { start, end }),
    );

    return categories.map((category) => {
      const displayBudget = getBudgetAmountInCurrency(category, currency);
      return {
        ...category,
        displayBudget,
        spent: monthlyExpenses
          .filter((transaction) => transaction.category.toLowerCase() === category.name.toLowerCase())
          .reduce((sum, transaction) => sum + getTransactionAmountInCurrency(transaction, currency), 0),
      };
    });
  }, [categories, currency, transactions]);

  const totalBudget = categoriesWithSpent.reduce((sum, category) => sum + category.displayBudget, 0);
  const totalSpent = categoriesWithSpent.reduce((sum, category) => sum + category.spent, 0);
  const totalGoalsTarget = goals.reduce(
    (sum, goal) => sum + getSavingsGoalAmountsInCurrency(goal, currency).targetAmount,
    0,
  );
  const totalGoalsSaved = goals.reduce(
    (sum, goal) => sum + getSavingsGoalAmountsInCurrency(goal, currency).currentAmount,
    0,
  );

  const getIcon = (iconName: string) => {
    const option = iconOptions.find((opt) => opt.value === iconName);
    return option ? option.icon : ShoppingCart;
  };

  const resetGoalForm = () => {
    setGoalName("");
    setGoalAmount("");
    setGoalCurrent("");
    setGoalEmoji("💻");
    setEditingGoal(null);
    setAddingGoal(false);
  };

  const resetCategoryForm = () => {
    setNewCategoryName("");
    setNewCategoryBudget("");
    setNewCategoryIcon("shopping");
    setNewCategoryColor("#95d5b2");
    setEditBudget("");
    setEditingCategory(null);
    setAddingCategory(false);
  };

  const handleSaveGoal = async () => {
    if (!user || !goalName || !goalAmount) {
      return;
    }

    if (editingGoal) {
      const updated = await updateSavingsGoal(user.id, editingGoal, {
        name: goalName,
        targetAmount: parseFloat(goalAmount),
        currentAmount: parseFloat(goalCurrent) || 0,
        currency,
        originalTargetAmount: parseFloat(goalAmount),
        originalCurrentAmount: parseFloat(goalCurrent) || 0,
        emoji: goalEmoji,
      });
      setGoals(goals.map((goal) => (goal.id === editingGoal ? updated : goal)));
    } else {
      const created = await createSavingsGoal(user.id, {
        name: goalName,
        targetAmount: parseFloat(goalAmount),
        currentAmount: parseFloat(goalCurrent) || 0,
        currency,
        originalTargetAmount: parseFloat(goalAmount),
        originalCurrentAmount: parseFloat(goalCurrent) || 0,
        emoji: goalEmoji,
      });
      setGoals([...goals, created]);
    }

    resetGoalForm();
    window.dispatchEvent(new Event("financialDataChanged"));
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!user || !confirm("Are you sure you want to delete this goal?")) {
      return;
    }

    await removeSavingsGoal(user.id, goalId);
    setGoals(goals.filter((goal) => goal.id !== goalId));
    window.dispatchEvent(new Event("financialDataChanged"));
  };

  const handlePinGoal = async (goalId: string) => {
    if (!user) {
      return;
    }

    const goal = goals.find((item) => item.id === goalId);
    if (!goal) {
      return;
    }

    const shouldPin = !goal.pinned;
    await updateSavingsGoal(user.id, goalId, { pinned: shouldPin });

    if (shouldPin) {
      setGoals(
        goals.map((item) => ({
          ...item,
          pinned: item.id === goalId,
        })),
      );
    } else {
      setGoals(goals.map((item) => (item.id === goalId ? { ...item, pinned: false } : item)));
    }

    window.dispatchEvent(new Event("financialDataChanged"));
  };

  const handleSaveBudget = async (categoryId: string) => {
    if (!user || !editBudget) {
      return;
    }

    const updated = await updateBudgetCategory(user.id, categoryId, {
      budget: parseFloat(editBudget),
      currency,
      originalBudget: parseFloat(editBudget),
    });

    setCategories(categories.map((category) => (category.id === categoryId ? updated : category)));
    setEditingCategory(null);
    setEditBudget("");
    window.dispatchEvent(new Event("financialDataChanged"));
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!user || !confirm("Are you sure you want to delete this category?")) {
      return;
    }

    await removeBudgetCategory(user.id, categoryId);
    setCategories(categories.filter((category) => category.id !== categoryId));
    window.dispatchEvent(new Event("financialDataChanged"));
  };

  const handleAddCategory = async () => {
    if (!user || !newCategoryName || !newCategoryBudget) {
      alert("Please fill in all fields");
      return;
    }

    const created = await createBudgetCategory(user.id, {
      name: newCategoryName,
      budget: parseFloat(newCategoryBudget),
      currency,
      originalBudget: parseFloat(newCategoryBudget),
      icon: newCategoryIcon,
      color: newCategoryColor,
    });

    setCategories([...categories, created]);
    resetCategoryForm();
    window.dispatchEvent(new Event("financialDataChanged"));
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-primary text-white rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Target className="size-5" />
              <h3 className="text-white">Savings Goals</h3>
            </div>
            <div className="text-3xl mb-1">{formatCurrency(totalGoalsSaved, currency)}</div>
            <div className="text-white/80 text-sm">of {formatCurrency(totalGoalsTarget, currency)} total</div>
            <div className="mt-3 w-full bg-white/20 rounded-full h-2">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${totalGoalsTarget ? (totalGoalsSaved / totalGoalsTarget) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="size-5 text-primary" />
              <h3>Monthly Budget</h3>
            </div>
            <div className="text-3xl mb-1">{formatCurrency(totalSpent, currency)}</div>
            <div className="text-muted-foreground text-sm">of {formatCurrency(totalBudget, currency)} budget</div>
            <div className="mt-3 w-full bg-muted rounded-full h-2">
              <div
                className={`h-full rounded-full transition-all ${
                  totalSpent > totalBudget ? "bg-destructive" : "bg-primary"
                }`}
                style={{ width: `${Math.min(totalBudget ? (totalSpent / totalBudget) * 100 : 0, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3>Your Savings Goals</h3>
            <button
              onClick={() => {
                setAddingGoal(true);
                setGoalName("");
                setGoalAmount("");
                setGoalCurrent("");
                setGoalEmoji("💻");
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="size-4" />
              Add Goal
            </button>
          </div>

          {isLoading ? (
            <div className="rounded-lg bg-secondary p-4 text-sm text-muted-foreground">Loading goals...</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {goals.length === 0 ? (
                <div className="rounded-lg bg-secondary p-4 text-sm text-muted-foreground">
                  No goals yet. Add your first savings target.
                </div>
              ) : (
                goals.map((goal) => {
                  const displayGoal = getSavingsGoalAmountsInCurrency(goal, currency);
                  const progress = displayGoal.targetAmount
                    ? (displayGoal.currentAmount / displayGoal.targetAmount) * 100
                    : 0;

                  return (
                    <div key={goal.id} className="bg-secondary rounded-lg p-4">
                      {editingGoal === goal.id ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-2xl">
                              {goalEmoji}
                            </div>
                            <div className="flex-1">
                              <input
                                type="text"
                                value={goalName}
                                onChange={(e) => setGoalName(e.target.value)}
                                className="w-full px-3 py-1 bg-input-background rounded border border-border focus:border-primary focus:outline-none"
                                placeholder="Goal name"
                              />
                            </div>
                          </div>

                          <input
                            type="number"
                            step="0.01"
                            value={goalAmount}
                            onChange={(e) => setGoalAmount(e.target.value)}
                            className="w-full px-3 py-2 bg-input-background rounded border border-border focus:border-primary focus:outline-none"
                            placeholder="Target amount"
                          />

                          <input
                            type="number"
                            step="0.01"
                            value={goalCurrent}
                            onChange={(e) => setGoalCurrent(e.target.value)}
                            className="w-full px-3 py-2 bg-input-background rounded border border-border focus:border-primary focus:outline-none"
                            placeholder="Current amount"
                          />

                          <div className="grid grid-cols-6 gap-2">
                            {emojiOptions.slice(0, 6).map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => setGoalEmoji(emoji)}
                                className={`text-xl p-2 rounded transition-all ${
                                  goalEmoji === emoji ? "bg-primary/20 scale-110" : "bg-muted hover:bg-accent"
                                }`}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveGoal}
                              className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:opacity-90 flex items-center justify-center gap-1"
                            >
                              <Check className="size-4" />
                              Save
                            </button>
                            <button
                              onClick={resetGoalForm}
                              className="px-4 bg-muted hover:bg-accent py-2 rounded-lg"
                            >
                              <X className="size-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-2xl">
                                {goal.emoji}
                              </div>
                              <div>
                                <div className="font-medium">{goal.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {formatCurrency(displayGoal.currentAmount, currency)} / {formatCurrency(displayGoal.targetAmount, currency)}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setEditingGoal(goal.id);
                                  setGoalName(goal.name);
                                  setGoalAmount(String(goal.originalTargetAmount));
                                  setGoalCurrent(String(goal.originalCurrentAmount));
                                  setGoalEmoji(goal.emoji);
                                }}
                                className="p-2 hover:bg-muted rounded-lg transition-colors"
                              >
                                <Edit2 className="size-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteGoal(goal.id)}
                                className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                              >
                                <Trash2 className="size-4" />
                              </button>
                              <button
                                onClick={() => handlePinGoal(goal.id)}
                                className={`p-2 hover:bg-muted rounded-lg transition-colors ${
                                  goal.pinned ? "bg-primary text-primary-foreground" : ""
                                }`}
                              >
                                {goal.pinned ? <Pin className="size-4" /> : <PinOff className="size-4" />}
                              </button>
                            </div>
                          </div>

                          <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all duration-300"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>

                          <div className="mt-2 flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{progress.toFixed(0)}% complete</span>
                            <span className="text-muted-foreground">
                              {formatCurrency(displayGoal.targetAmount - displayGoal.currentAmount, currency)} to go
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3>Category Budgets</h3>
            <button
              onClick={() => setAddingCategory(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="size-4" />
              Add Category
            </button>
          </div>

          {isLoading ? (
            <div className="rounded-lg bg-secondary p-4 text-sm text-muted-foreground">Loading budget categories...</div>
          ) : (
            <div className="space-y-3">
              {categoriesWithSpent.length === 0 ? (
                <div className="rounded-lg bg-secondary p-4 text-sm text-muted-foreground">
                  No budget categories yet. Add one to start tracking against transactions.
                </div>
              ) : (
                categoriesWithSpent.map((category) => {
                  const percentage = category.displayBudget ? (category.spent / category.displayBudget) * 100 : 0;
                  const isOverBudget = category.spent > category.displayBudget;
                  const IconComponent = getIcon(category.icon);

                  return (
                    <div key={category.id} className="bg-secondary rounded-lg p-4">
                      {editingCategory === category.id ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                              style={{ backgroundColor: category.color }}
                            >
                              <IconComponent className="size-5" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{category.name}</div>
                            </div>
                          </div>

                          <div>
                            <label className="text-sm text-muted-foreground mb-2 block">Monthly Budget ($)</label>
                            <input
                              type="number"
                              step="0.01"
                              value={editBudget}
                              onChange={(e) => setEditBudget(e.target.value)}
                              className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                              autoFocus
                            />
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveBudget(category.id)}
                              className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                            >
                              <Check className="size-4" />
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingCategory(null);
                                setEditBudget("");
                              }}
                              className="px-4 bg-muted hover:bg-accent py-2 rounded-lg transition-colors"
                            >
                              <X className="size-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                                style={{ backgroundColor: category.color }}
                              >
                                <IconComponent className="size-5" />
                              </div>
                              <div>
                                <div className="font-medium">{category.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {formatCurrency(category.spent, currency)} / {formatCurrency(category.displayBudget, currency)}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingCategory(category.id);
                                  setEditBudget(String(category.originalBudget));
                                }}
                                className="p-2 hover:bg-muted rounded-lg transition-colors"
                              >
                                <Edit2 className="size-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(category.id)}
                                className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          </div>

                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isOverBudget ? "bg-destructive" : "bg-primary"
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                          <div className="text-sm text-muted-foreground mt-2 flex items-center justify-between">
                            <span>{percentage.toFixed(1)}% used</span>
                            {isOverBudget ? (
                              <span className="text-destructive">⚠️ {formatCurrency(category.spent - category.displayBudget, currency)} over</span>
                            ) : (
                              <span className="text-primary">{formatCurrency(category.displayBudget - category.spent, currency)} left</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {addingGoal ? (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full">
              <div className="sticky top-0 bg-primary text-primary-foreground px-6 py-4 rounded-t-2xl flex items-center justify-between">
                <h2 className="text-white">Add New Goal</h2>
                <button onClick={resetGoalForm} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
                  <X className="size-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Goal Name</label>
                  <input
                    type="text"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    placeholder="e.g., New Laptop"
                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Target Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={goalAmount}
                    onChange={(e) => setGoalAmount(e.target.value)}
                    placeholder="1200"
                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Current Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={goalCurrent}
                    onChange={(e) => setGoalCurrent(e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Emoji Icon</label>
                  <div className="grid grid-cols-7 gap-2">
                    {emojiOptions.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setGoalEmoji(emoji)}
                        className={`text-2xl p-3 rounded-lg transition-all ${
                          goalEmoji === emoji ? "bg-primary/20 scale-110" : "bg-secondary hover:bg-accent"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSaveGoal}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Plus className="size-4" />
                  Add Goal
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {addingCategory ? (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-primary text-primary-foreground px-6 py-4 rounded-t-2xl flex items-center justify-between">
                <h2 className="text-white">Add New Category</h2>
                <button onClick={resetCategoryForm} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
                  <X className="size-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block flex items-center gap-1">
                    <Tag className="size-4" />
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g., Gym"
                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block flex items-center gap-1">
                    <DollarSign className="size-4" />
                    Monthly Budget
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newCategoryBudget}
                    onChange={(e) => setNewCategoryBudget(e.target.value)}
                    placeholder="100"
                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Icon</label>
                  <div className="grid grid-cols-4 gap-2">
                    {iconOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setNewCategoryIcon(option.value)}
                          className={`p-3 rounded-lg transition-all flex flex-col items-center gap-1 ${
                            newCategoryIcon === option.value ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-accent"
                          }`}
                        >
                          <Icon className="size-5" />
                          <span className="text-xs">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Color</label>
                  <div className="grid grid-cols-5 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewCategoryColor(color)}
                        className={`w-full aspect-square rounded-lg transition-all ${
                          newCategoryColor === color ? "ring-4 ring-primary ring-offset-2" : "hover:scale-110"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleAddCategory}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Plus className="size-4" />
                  Add Category
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  );
}
