import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Target,
  PiggyBank,
  ShoppingCart,
  Book,
  Utensils,
  Bus,
  Film,
  Calendar,
  CalendarDays,
  CalendarRange,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  eachMonthOfInterval,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";
import Layout from "../components/Layout";
import { useUserCurrency } from "../hooks/useUserCurrency";
import { BRAND_LOGO_SRC } from "../lib/branding";
import { convertCurrency, formatCurrency, formatCurrencyWithCode } from "../lib/currency";
import {
  createGoalContribution,
  getBudgetAmountInCurrency,
  getSavingsGoalAmountsInCurrency,
  listBudgetCategories,
  listSavingsGoals,
} from "../lib/finance";
import {
  formatTransactionDate,
  getTransactionAmountInCurrency,
  listTransactions,
  parseTransactionDate,
} from "../lib/transactions";
import { useAuth } from "../providers/AuthProvider";
import { useI18n } from "../providers/I18nProvider";
import type { BudgetCategory, SavingsGoal } from "../types/finance";
import type { Transaction } from "../types/transactions";

const CHART_COLORS = ["#2d6a4f", "#52b788", "#74c69d", "#95d5b2", "#b7e4c7", "#40916c"];

export default function Home() {
  const { user } = useAuth();
  const { t, localizeCategory } = useI18n();
  const currency = useUserCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<"week" | "month" | "year">("month");
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [contributionAmount, setContributionAmount] = useState("");
  const [contributionNote, setContributionNote] = useState("");

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setGoals([]);
      setBudgetCategories([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadTransactions = async () => {
      setIsLoading(true);

      try {
        const [transactionData, goalData, budgetData] = await Promise.all([
          listTransactions(user.id),
          listSavingsGoals(user.id),
          listBudgetCategories(user.id),
        ]);
        if (isMounted) {
          setTransactions(transactionData);
          setGoals(goalData);
          setBudgetCategories(budgetData);
        }
      } catch {
        if (isMounted) {
          setTransactions([]);
          setGoals([]);
          setBudgetCategories([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadTransactions();

    const handleTransactionsChanged = () => {
      loadTransactions();
    };

    window.addEventListener("transactionsChanged", handleTransactionsChanged);

    return () => {
      isMounted = false;
      window.removeEventListener("transactionsChanged", handleTransactionsChanged);
    };
  }, [user]);

  const userName =
    user?.user_metadata?.full_name?.trim().split(/\s+/)[0] || user?.email?.split("@")[0] || "";
  const pinnedGoal = goals.find((goal) => goal.pinned) ?? goals[0] ?? null;
  const pinnedGoalAmounts = pinnedGoal
    ? getSavingsGoalAmountsInCurrency(pinnedGoal, currency)
    : { targetAmount: 0, currentAmount: 0 };
  const savingsGoal = pinnedGoalAmounts.targetAmount;
  const currentSavings = pinnedGoalAmounts.currentAmount;
  const savingsProgress = savingsGoal ? (currentSavings / savingsGoal) * 100 : 0;

  const currentMonthTransactions = useMemo(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    return transactions.filter((transaction) =>
      isWithinInterval(parseTransactionDate(transaction.occurredOn), { start, end }),
    );
  }, [transactions]);

  const balance = useMemo(
    () =>
      transactions.reduce(
        (sum, transaction) =>
          transaction.type === "income"
            ? sum + getTransactionAmountInCurrency(transaction, currency)
            : sum - getTransactionAmountInCurrency(transaction, currency),
        0,
      ),
    [currency, transactions],
  );

  const monthlyIncome = useMemo(
    () =>
      currentMonthTransactions
        .filter((transaction) => transaction.type === "income")
        .reduce((sum, transaction) => sum + getTransactionAmountInCurrency(transaction, currency), 0),
    [currency, currentMonthTransactions],
  );

  const monthlyExpenses = useMemo(
    () =>
      currentMonthTransactions
        .filter((transaction) => transaction.type === "expense")
        .reduce((sum, transaction) => sum + getTransactionAmountInCurrency(transaction, currency), 0),
    [currency, currentMonthTransactions],
  );

  const monthlyBudgetOverview = useMemo(() => {
    return budgetCategories
      .map((category) => {
        const budget = getBudgetAmountInCurrency(category, currency);
        const spent = currentMonthTransactions
          .filter(
            (transaction) =>
              transaction.type === "expense" &&
              transaction.category.toLowerCase() === category.name.toLowerCase(),
          )
          .reduce((sum, transaction) => sum + getTransactionAmountInCurrency(transaction, currency), 0);

        return {
          id: category.id,
          name: category.name,
          budget,
          spent,
          percentage: budget > 0 ? (spent / budget) * 100 : 0,
          remaining: budget - spent,
          isOverBudget: spent > budget,
        };
      })
      .sort((a, b) => b.percentage - a.percentage);
  }, [budgetCategories, currency, currentMonthTransactions]);

  const expensesByCategory = useMemo(() => {
    const now = new Date();
    const interval =
      timePeriod === "week"
        ? { start: startOfWeek(now), end: endOfWeek(now) }
        : timePeriod === "year"
          ? { start: startOfYear(now), end: endOfYear(now) }
          : { start: startOfMonth(now), end: endOfMonth(now) };

    const expenseTransactions = transactions.filter(
      (transaction) =>
        transaction.type === "expense" &&
        isWithinInterval(parseTransactionDate(transaction.occurredOn), interval),
    );

    const byCategory = expenseTransactions.reduce<Record<string, number>>((acc, transaction) => {
      acc[transaction.category] =
        (acc[transaction.category] ?? 0) + getTransactionAmountInCurrency(transaction, currency);
      return acc;
    }, {});

    return Object.entries(byCategory).map(([name, value], index) => ({
      name,
      value,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }));
  }, [currency, timePeriod, transactions]);

  const timeSeriesData = useMemo(() => {
    const now = new Date();

    if (timePeriod === "week") {
      const start = startOfWeek(now);
      return Array.from({ length: 7 }, (_, index) => {
        const day = new Date(start);
        day.setDate(start.getDate() + index);
        const sameDay = transactions.filter(
          (transaction) =>
            format(parseTransactionDate(transaction.occurredOn), "yyyy-MM-dd") === format(day, "yyyy-MM-dd"),
        );

        return {
          period: format(day, "EEE"),
          income: sameDay
            .filter((transaction) => transaction.type === "income")
            .reduce((sum, transaction) => sum + getTransactionAmountInCurrency(transaction, currency), 0),
          expenses: sameDay
            .filter((transaction) => transaction.type === "expense")
            .reduce((sum, transaction) => sum + getTransactionAmountInCurrency(transaction, currency), 0),
        };
      });
    }

    if (timePeriod === "year") {
      return eachMonthOfInterval({
        start: startOfYear(now),
        end: endOfMonth(now),
      }).map((month) => {
        const inMonth = transactions.filter(
          (transaction) =>
            format(parseTransactionDate(transaction.occurredOn), "yyyy-MM") === format(month, "yyyy-MM"),
        );

        return {
          period: format(month, "MMM"),
          income: inMonth
            .filter((transaction) => transaction.type === "income")
            .reduce((sum, transaction) => sum + getTransactionAmountInCurrency(transaction, currency), 0),
          expenses: inMonth
            .filter((transaction) => transaction.type === "expense")
            .reduce((sum, transaction) => sum + getTransactionAmountInCurrency(transaction, currency), 0),
        };
      });
    }

    return Object.values(
      currentMonthTransactions.reduce<
        Record<string, { period: string; income: number; expenses: number }>
      >((acc, transaction) => {
        const period = format(parseTransactionDate(transaction.occurredOn), "MMM d");
        if (!acc[period]) {
          acc[period] = { period, income: 0, expenses: 0 };
        }
        if (transaction.type === "income") {
          acc[period].income += getTransactionAmountInCurrency(transaction, currency);
        } else {
          acc[period].expenses += getTransactionAmountInCurrency(transaction, currency);
        }
        return acc;
      }, {}),
    );
  }, [currency, currentMonthTransactions, timePeriod, transactions]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("home.goodMorning");
    if (hour < 18) return t("home.goodAfternoon");
    return t("home.goodEvening");
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "food":
        return <Utensils className="size-4" />;
      case "books":
        return <Book className="size-4" />;
      case "transport":
        return <Bus className="size-4" />;
      case "entertainment":
        return <Film className="size-4" />;
      case "job":
      case "scholarship":
      case "income":
        return <TrendingUp className="size-4" />;
      default:
        return <ShoppingCart className="size-4" />;
    }
  };

  const handleContributeToGoal = async () => {
    if (!user || !pinnedGoal || !contributionAmount) {
      return;
    }

    await createGoalContribution(user.id, pinnedGoal.id, {
      amount: parseFloat(contributionAmount),
      currency,
      originalAmount: parseFloat(contributionAmount),
      contributionType: "manual",
      source: "home_bamboo",
      note: contributionNote || null,
    });

    setGoals((current) =>
      current.map((goal) =>
        goal.id === pinnedGoal.id
          ? {
              ...goal,
              currentAmount:
                goal.currentAmount + convertCurrency(parseFloat(contributionAmount), currency, goal.currency),
              originalCurrentAmount:
                goal.originalCurrentAmount +
                convertCurrency(parseFloat(contributionAmount), currency, goal.currency),
            }
          : goal,
      ),
    );

    setContributionAmount("");
    setContributionNote("");
    setShowContributionModal(false);
    window.dispatchEvent(new Event("financialDataChanged"));
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl">
              {getGreeting()}
              {userName ? `, ${userName}` : ""}!
            </h2>
            <img
              src={BRAND_LOGO_SRC}
              alt="Bambuu logo"
              className="h-8 w-8 object-contain"
            />
          </div>
          <p className="text-muted-foreground">{t("home.overview")}</p>
        </div>

        <div className="bg-primary text-white rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex items-center gap-2 mb-2 opacity-90">
            <Wallet className="size-5" />
            <span className="text-sm">{t("home.totalBalance")}</span>
          </div>
          <div className="text-4xl mb-4">{formatCurrency(balance, currency)}</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="size-4" />
                <span className="text-xs opacity-90">{t("home.income")}</span>
              </div>
              <div className="text-xl">{formatCurrency(monthlyIncome, currency)}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="size-4" />
                <span className="text-xs opacity-90">{t("home.expenses")}</span>
              </div>
              <div className="text-xl">{formatCurrency(monthlyExpenses, currency)}</div>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="flex-1 space-y-6">
            <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{t("home.view")}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTimePeriod("week")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      timePeriod === "week"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    <Calendar className="size-4" />
                    {t("home.week")}
                  </button>
                  <button
                    onClick={() => setTimePeriod("month")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      timePeriod === "month"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    <CalendarDays className="size-4" />
                    {t("home.month")}
                  </button>
                  <button
                    onClick={() => setTimePeriod("year")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      timePeriod === "year"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    <CalendarRange className="size-4" />
                    {t("home.year")}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <h3 className="mb-4 flex items-center gap-2">
                  <Target className="size-5 text-primary" />
                  {t("home.spendingByCategory")}
                </h3>
                {expensesByCategory.length === 0 ? (
                  <div className="h-[250px] flex flex-col items-center justify-center rounded-lg bg-muted/40 text-center">
                    <div className="text-4xl text-primary mb-2">{formatCurrency(0, currency)}</div>
                    <p className="text-sm text-muted-foreground">{t("home.noExpenseData")}</p>
                  </div>
                ) : (
                  <div suppressHydrationWarning>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart key={`spending-pie-${timePeriod}`}>
                        <Pie
                          data={expensesByCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${formatCurrency(Number(value), currency)}`}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {expensesByCategory.map((entry, index) => (
                            <Cell key={`home-spending-cell-${entry.name}-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {expensesByCategory.length === 0 ? (
                    <div className="text-sm text-muted-foreground">{formatCurrency(0, currency)} {t("home.totalSuffix")}</div>
                  ) : (
                    expensesByCategory.map((category, index) => (
                      <div key={`legend-${category.name}-${index}`} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                        <span className="text-sm text-muted-foreground">{localizeCategory(category.name)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <h3 className="mb-4 flex items-center gap-2">
                  <TrendingUp className="size-5 text-primary" />
                  {t("home.monthlyOverview")}
                </h3>
                <div suppressHydrationWarning>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={timeSeriesData} key={`overview-bar-${timePeriod}`}>
                      <XAxis dataKey="period" stroke="#52796f" />
                      <YAxis stroke="#52796f" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #95d5b2",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="income" fill="#2d6a4f" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="expenses" fill="#95d5b2" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: "#2d6a4f" }} />
                    <span className="text-sm text-muted-foreground">{t("home.income")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: "#95d5b2" }} />
                    <span className="text-sm text-muted-foreground">{t("home.expenses")}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <h3 className="mb-4 flex items-center gap-2">
                <Wallet className="size-5 text-primary" />
                {t("home.monthlyBudgetStatus")}
              </h3>
              {monthlyBudgetOverview.length === 0 ? (
                <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                  {t("home.noBudgetCategories")}
                </div>
              ) : (
                <div className="space-y-3">
                  {monthlyBudgetOverview.map((category) => (
                    <div key={category.id} className="rounded-lg bg-muted/50 px-4 py-3">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="font-medium">{localizeCategory(category.name)}</div>
                        <div className={`text-xs ${category.isOverBudget ? "text-destructive" : "text-primary"}`}>
                          {category.isOverBudget
                            ? t("home.overBudget", {
                                amount: formatCurrency(Math.abs(category.remaining), currency),
                              })
                            : t("home.remainingBudget", {
                                amount: formatCurrency(category.remaining, currency),
                              })}
                        </div>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className={`h-full rounded-full transition-all ${category.isOverBudget ? "bg-destructive" : "bg-primary"}`}
                          style={{ width: `${Math.min(category.percentage, 100)}%` }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatCurrency(category.spent, currency)} / {formatCurrency(category.budget, currency)}</span>
                        <span>{t("home.budgetUsed", { value: category.percentage.toFixed(0) })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3>{t("home.recentTransactions")}</h3>
                <Link to="/transactions" className="text-primary hover:underline text-sm">
                  {t("home.viewAll")}
                </Link>
              </div>
              <div className="space-y-3">
                {isLoading ? (
                  <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                    {t("home.loadingTransactions")}
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                    {t("home.noTransactions")}
                  </div>
                ) : (
                  transactions.slice(0, 6).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-secondary transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === "income" ? "bg-primary/10 text-primary" : "bg-accent"
                        }`}>
                          {getCategoryIcon(transaction.category)}
                        </div>
                        <div>
                          <div>{transaction.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {localizeCategory(transaction.category)} • {formatTransactionDate(transaction.occurredOn)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {t("common.paidIn", {
                              amount: formatCurrencyWithCode(transaction.originalAmount, transaction.currency),
                            })}
                          </div>
                        </div>
                      </div>
                      <div className={transaction.type === "income" ? "text-primary" : "text-foreground"}>
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(getTransactionAmountInCurrency(transaction, currency), currency)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border border-border flex flex-col items-center" style={{ minHeight: "calc(100vh - 450px)" }}>
            <div className="mb-4 text-center">
              <div className="w-20 h-20 bg-accent rounded-2xl flex items-center justify-center shadow-md mb-2">
                <span className="text-3xl">{pinnedGoal?.emoji ?? "🎯"}</span>
              </div>
              <div className="text-xs text-muted-foreground">{t("home.goal")}</div>
              <div className="text-sm font-medium mt-1">{pinnedGoal ? formatCurrency(savingsGoal, currency) : t("home.noGoalPinned")}</div>
              {pinnedGoal ? (
                <button
                  onClick={() => setShowContributionModal(true)}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  <PiggyBank className="size-4" />
                  {t("home.contribute")}
                </button>
              ) : null}
            </div>

            <div className="relative flex-1 w-16 min-h-[400px] overflow-visible">
              <div className="absolute bottom-0 left-1/2 h-full w-16 -translate-x-1/2 rounded-[999px] bg-[#eef1e6] shadow-inner border border-[#d8ddcc]" />

              <div className="absolute bottom-0 left-1/2 h-full w-8 -translate-x-1/2 rounded-[999px] border border-[#5b8d3a] bg-gradient-to-b from-[#a8d86d] via-[#78b94f] to-[#4d8731] shadow-[inset_-6px_0_8px_rgba(255,255,255,0.28),inset_8px_0_12px_rgba(0,0,0,0.14)]">
                <div className="absolute inset-y-0 left-[42%] w-[2px] bg-white/20" />
                <div className="absolute left-0 right-0 top-[12%] h-[6px] rounded-full bg-[#628d3e]" />
                <div className="absolute left-0 right-0 top-[28%] h-[6px] rounded-full bg-[#628d3e]" />
                <div className="absolute left-0 right-0 top-[44%] h-[6px] rounded-full bg-[#628d3e]" />
                <div className="absolute left-0 right-0 top-[60%] h-[6px] rounded-full bg-[#628d3e]" />
                <div className="absolute left-0 right-0 top-[76%] h-[6px] rounded-full bg-[#628d3e]" />
                <div className="absolute left-0 right-0 top-[92%] h-[6px] rounded-full bg-[#628d3e]" />
              </div>

              <div className="absolute left-1/2 top-[10%] -translate-x-[18px] -translate-y-1/2 rotate-[-28deg]">
                <svg width="70" height="42" viewBox="0 0 100 60" className="drop-shadow-sm">
                  <path d="M95 50C77 48 62 43 46 31C32 20 20 11 6 7C14 23 27 35 43 43C59 51 76 54 95 50Z" fill="#4b9847" />
                  <path d="M87 46C71 43 57 37 43 25" stroke="#a8df8c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </svg>
              </div>

              <div className="absolute left-1/2 top-[34%] translate-x-[12px] -translate-y-1/2 rotate-[24deg]">
                <svg width="72" height="44" viewBox="0 0 100 60" className="drop-shadow-sm">
                  <path d="M6 52C24 49 39 43 55 31C69 20 81 11 95 7C87 24 74 36 58 44C42 52 25 55 6 52Z" fill="#4f9f4c" />
                  <path d="M14 47C30 43 44 37 58 25" stroke="#b4e79a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </svg>
              </div>

              <div className="absolute left-1/2 top-[58%] -translate-x-[20px] -translate-y-1/2 rotate-[-24deg] opacity-90">
                <svg width="64" height="38" viewBox="0 0 100 60" className="drop-shadow-sm">
                  <path d="M95 50C77 48 62 43 46 31C32 20 20 11 6 7C14 23 27 35 43 43C59 51 76 54 95 50Z" fill="#58ab52" />
                  <path d="M87 46C71 43 57 37 43 25" stroke="#c4efab" strokeWidth="2.3" fill="none" strokeLinecap="round" />
                </svg>
              </div>

              <div
                className="absolute left-1/2 -translate-x-[58%] transition-all duration-700 ease-out"
                style={{ bottom: `${Math.max(savingsProgress - 4, 0)}%` }}
              >
                <div className="relative h-[92px] w-[88px]">
                  <svg viewBox="0 0 110 110" className="h-full w-full drop-shadow-md animate-climb-sway">
                    <ellipse cx="30" cy="67" rx="13" ry="19" fill="#1f1f1f" transform="rotate(-28 30 67)" />
                    <ellipse cx="77" cy="58" rx="13" ry="19" fill="#1f1f1f" transform="rotate(34 77 58)" />
                    <ellipse cx="39" cy="96" rx="15" ry="19" fill="#1f1f1f" transform="rotate(-12 39 96)" />
                    <ellipse cx="71" cy="93" rx="15" ry="19" fill="#1f1f1f" transform="rotate(18 71 93)" />
                    <ellipse cx="56" cy="70" rx="28" ry="33" fill="#f6f2ea" />
                    <circle cx="57" cy="34" r="23" fill="#f6f2ea" />
                    <circle cx="41" cy="18" r="10" fill="#1f1f1f" />
                    <circle cx="72" cy="18" r="10" fill="#1f1f1f" />
                    <ellipse cx="48" cy="34" rx="7" ry="9" fill="#1f1f1f" transform="rotate(-12 48 34)" />
                    <ellipse cx="65" cy="35" rx="7" ry="9" fill="#1f1f1f" transform="rotate(12 65 35)" />
                    <circle cx="49" cy="35" r="2.4" fill="#ffffff" />
                    <circle cx="65" cy="35" r="2.4" fill="#ffffff" />
                    <ellipse cx="57" cy="44" rx="4.5" ry="3.2" fill="#1f1f1f" />
                    <path d="M52 49 Q57 53 63 49" stroke="#1f1f1f" strokeWidth="2.2" fill="none" strokeLinecap="round" />
                    <path d="M42 55 Q31 49 25 40" stroke="#1f1f1f" strokeWidth="6" fill="none" strokeLinecap="round" />
                    <path d="M69 58 Q81 55 87 47" stroke="#1f1f1f" strokeWidth="6" fill="none" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              <div
                className="absolute -left-12 transition-all duration-700 ease-out"
                style={{ top: `${100 - savingsProgress}%` }}
              >
                <div className="bg-white border border-primary rounded px-2 py-1 shadow-sm">
                  <div className="text-xs font-medium text-primary">{savingsProgress.toFixed(0)}%</div>
                </div>
              </div>

              <style>{`
                @keyframes climb-sway {
                  0%, 100% { transform: translateY(0px) rotate(-3deg); }
                  50% { transform: translateY(-2px) rotate(3deg); }
                }
                .animate-climb-sway {
                  animation: climb-sway 2.4s ease-in-out infinite;
                }
              `}</style>
            </div>

            <div className="mt-4 text-center">
              <div className="text-xs text-muted-foreground">{t("home.start")}</div>
              <div className="text-sm">{formatCurrency(0, currency)}</div>
              <div className="mt-3 bg-accent/30 px-3 py-2 rounded-lg max-w-[140px]">
                <p className="text-xs">
                  {pinnedGoal
                    ? t("home.toGo", {
                        amount: formatCurrency(savingsGoal - currentSavings, currency),
                        emoji: pinnedGoal.emoji,
                      })
                    : t("home.pinGoal")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {showContributionModal && pinnedGoal ? (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full">
              <div className="sticky top-0 bg-primary text-primary-foreground px-6 py-4 rounded-t-2xl flex items-center justify-between">
                <h2 className="text-white">{t("home.contributeToGoal")}</h2>
                <button
                  onClick={() => {
                    setShowContributionModal(false);
                    setContributionAmount("");
                    setContributionNote("");
                  }}
                  className="hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">{t("home.contributionAmount")}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">{t("home.contributionNote")}</label>
                  <input
                    type="text"
                    value={contributionNote}
                    onChange={(e) => setContributionNote(e.target.value)}
                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder={t("home.contributionNotePlaceholder")}
                  />
                </div>
                <button
                  onClick={handleContributeToGoal}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <PiggyBank className="size-4" />
                  {t("home.contribute")}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  );
}
