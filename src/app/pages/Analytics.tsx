import { useEffect, useMemo, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
  BarChart3,
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
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
} from "date-fns";
import Layout from "../components/Layout";
import { useUserCurrency } from "../hooks/useUserCurrency";
import { formatCurrency } from "../lib/currency";
import {
  getBudgetAmountInCurrency,
  getSavingsGoalAmountsInCurrency,
  getSubscriptionAmountInCurrency,
  listBudgetCategories,
  listSavingsGoals,
  listSubscriptions,
} from "../lib/finance";
import { getTransactionAmountInCurrency, listTransactions, parseTransactionDate } from "../lib/transactions";
import { useAuth } from "../providers/AuthProvider";
import { useI18n } from "../providers/I18nProvider";
import type { BudgetCategory, SavingsGoal, Subscription } from "../types/finance";
import type { Transaction } from "../types/transactions";

const CHART_COLORS = ["#2d6a4f", "#52b788", "#74c69d", "#95d5b2", "#b7e4c7", "#40916c"];

export default function Analytics() {
  const { user } = useAuth();
  const { t, localizeCategory } = useI18n();
  const currency = useUserCurrency();
  const [timePeriod, setTimePeriod] = useState<"week" | "month" | "year">("month");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setBudgetCategories([]);
      setGoals([]);
      setSubscriptions([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [transactionData, categoryData, goalData, subscriptionData] = await Promise.all([
          listTransactions(user.id),
          listBudgetCategories(user.id),
          listSavingsGoals(user.id),
          listSubscriptions(user.id),
        ]);

        if (!isMounted) {
          return;
        }

        setTransactions(transactionData);
        setBudgetCategories(categoryData);
        setGoals(goalData);
        setSubscriptions(subscriptionData);
      } catch {
        if (!isMounted) {
          return;
        }

        setTransactions([]);
        setBudgetCategories([]);
        setGoals([]);
        setSubscriptions([]);
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

  const now = new Date();

  const selectedInterval = useMemo(() => {
    if (timePeriod === "week") {
      return { start: startOfWeek(now), end: endOfWeek(now) };
    }
    if (timePeriod === "year") {
      return { start: startOfYear(now), end: endOfYear(now) };
    }
    return { start: startOfMonth(now), end: endOfMonth(now) };
  }, [now, timePeriod]);

  const periodTransactions = useMemo(
    () =>
      transactions.filter((transaction) =>
        isWithinInterval(parseTransactionDate(transaction.occurredOn), selectedInterval),
      ),
    [selectedInterval, transactions],
  );

  const expenseTransactions = periodTransactions.filter((transaction) => transaction.type === "expense");
  const incomeTransactions = periodTransactions.filter((transaction) => transaction.type === "income");

  const totalIncome = incomeTransactions.reduce(
    (sum, transaction) => sum + getTransactionAmountInCurrency(transaction, currency),
    0,
  );
  const totalExpenses = expenseTransactions.reduce(
    (sum, transaction) => sum + getTransactionAmountInCurrency(transaction, currency),
    0,
  );
  const totalSaved = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((totalSaved / totalIncome) * 100).toFixed(1) : "0.0";

  const categoryData = useMemo(() => {
    const totals = expenseTransactions.reduce<Record<string, number>>((acc, transaction) => {
      acc[transaction.category] =
        (acc[transaction.category] ?? 0) + getTransactionAmountInCurrency(transaction, currency);
      return acc;
    }, {});

    const total = Object.values(totals).reduce((sum, value) => sum + value, 0);

    return Object.entries(totals)
      .map(([name, value], index) => ({
        name,
        value,
        color: CHART_COLORS[index % CHART_COLORS.length],
        percentage: total > 0 ? Number(((value / total) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [currency, expenseTransactions]);

  const topCategory = categoryData[0];

  const monthlyComparison = useMemo(() => {
    return eachMonthOfInterval({
      start: startOfMonth(subMonths(now, 5)),
      end: endOfMonth(now),
    }).map((month) => {
      const monthKey = format(month, "yyyy-MM");
      const inMonth = transactions.filter(
        (transaction) => format(parseTransactionDate(transaction.occurredOn), "yyyy-MM") === monthKey,
      );
      const income = inMonth
        .filter((transaction) => transaction.type === "income")
        .reduce((sum, transaction) => sum + getTransactionAmountInCurrency(transaction, currency), 0);
      const expenses = inMonth
        .filter((transaction) => transaction.type === "expense")
        .reduce((sum, transaction) => sum + getTransactionAmountInCurrency(transaction, currency), 0);

      return {
        month: format(month, "MMM"),
        income,
        expenses,
        savings: income - expenses,
      };
    });
  }, [currency, now, transactions]);

  const previousMonthData = monthlyComparison[monthlyComparison.length - 2];
  const currentMonthData = monthlyComparison[monthlyComparison.length - 1];
  const spendingChange =
    previousMonthData && previousMonthData.expenses > 0
      ? (((currentMonthData.expenses - previousMonthData.expenses) / previousMonthData.expenses) * 100)
      : 0;

  const dailySpending = useMemo(() => {
    return eachDayOfInterval({
      start: startOfDay(subDays(now, 13)),
      end: endOfDay(now),
    }).map((day) => {
      const amount = transactions
        .filter(
          (transaction) =>
            transaction.type === "expense" &&
            format(parseTransactionDate(transaction.occurredOn), "yyyy-MM-dd") === format(day, "yyyy-MM-dd"),
        )
        .reduce((sum, transaction) => sum + getTransactionAmountInCurrency(transaction, currency), 0);

      return {
        day: format(day, "MMM d"),
        amount,
      };
    });
  }, [currency, now, transactions]);

  const avgDailySpending = (
    dailySpending.reduce((sum, item) => sum + item.amount, 0) / (dailySpending.length || 1)
  ).toFixed(2);

  const budgetComparison = useMemo(() => {
    return budgetCategories.map((category) => {
      const actual = expenseTransactions
        .filter((transaction) => transaction.category.toLowerCase() === category.name.toLowerCase())
        .reduce((sum, transaction) => sum + getTransactionAmountInCurrency(transaction, currency), 0);

      return {
        category: category.name,
        budget: getBudgetAmountInCurrency(category, currency),
        actual,
      };
    });
  }, [budgetCategories, currency, expenseTransactions]);

  const overBudgetCategory = budgetComparison
    .filter((category) => category.actual > category.budget)
    .sort((a, b) => b.actual - b.budget - (a.actual - a.budget))[0];

  const categoryTrends = useMemo(() => {
    const trackedCategories = budgetCategories.slice(0, 4);

    return eachMonthOfInterval({
      start: startOfMonth(subMonths(now, 2)),
      end: endOfMonth(now),
    }).map((month) => {
      const monthKey = format(month, "yyyy-MM");
      const row: Record<string, string | number> = { month: format(month, "MMM") };

      trackedCategories.forEach((category) => {
        row[category.name.toLowerCase()] = transactions
          .filter(
            (transaction) =>
              transaction.type === "expense" &&
              transaction.category.toLowerCase() === category.name.toLowerCase() &&
              format(parseTransactionDate(transaction.occurredOn), "yyyy-MM") === monthKey,
          )
          .reduce((sum, transaction) => sum + getTransactionAmountInCurrency(transaction, currency), 0);
      });

      return row;
    });
  }, [budgetCategories, currency, now, transactions]);

  const recommendations = useMemo(() => {
    const items: Array<{ title: string; message: string }> = [];

    if (overBudgetCategory) {
      items.push({
        title: t("analytics.reduceCategory", { category: localizeCategory(overBudgetCategory.category) }),
        message: t("analytics.overBudgetInCategory", {
          amount: formatCurrency(overBudgetCategory.actual - overBudgetCategory.budget, currency),
          category: localizeCategory(overBudgetCategory.category),
        }),
      });
    }

    const foodCategory = categoryData.find((category) => category.name.toLowerCase() === "food");
    if (foodCategory) {
      items.push({
        title: t("analytics.reviewFood"),
        message:
          foodCategory.percentage > 30
            ? t("analytics.foodHigh")
            : t("analytics.foodControlled"),
      });
    }

    const pinnedGoal = goals.find((goal) => goal.pinned) ?? goals[0];
    if (pinnedGoal) {
      const displayGoal = getSavingsGoalAmountsInCurrency(pinnedGoal, currency);
      const remaining = displayGoal.targetAmount - displayGoal.currentAmount;
      items.push({
        title: t("analytics.trackGoal"),
        message: remaining > 0
          ? t("analytics.goalNeeds", {
              name: pinnedGoal.name,
              amount: formatCurrency(remaining, currency),
            })
          : t("analytics.goalFunded", { name: pinnedGoal.name }),
      });
    }

    if (subscriptions.length > 0) {
      const monthlySubscriptionTotal = subscriptions.reduce(
        (sum, subscription) => sum + getSubscriptionAmountInCurrency(subscription, currency),
        0,
      );
      items.push({
        title: t("analytics.auditRecurring"),
        message: t("analytics.subscriptionsTotal", {
          amount: formatCurrency(monthlySubscriptionTotal, currency),
        }),
      });
    }

    return items.slice(0, 3);
  }, [categoryData, goals, overBudgetCategory, subscriptions]);

  const trackedTrendCategories = budgetCategories.slice(0, 4);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{t("analytics.view")}</span>
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

        {isLoading ? (
          <div className="bg-card border border-border rounded-xl p-6 text-sm text-muted-foreground">
            {t("analytics.loading")}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="text-sm text-muted-foreground mb-1">{t("analytics.savingsRate")}</div>
                <div className="text-2xl text-primary">{savingsRate}%</div>
                <div className="text-xs text-muted-foreground mt-1">{t("analytics.ofIncome")}</div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="text-sm text-muted-foreground mb-1">{t("analytics.avgDaily")}</div>
                <div className="text-2xl">{formatCurrency(Number(avgDailySpending), currency)}</div>
                <div className="text-xs text-muted-foreground mt-1">{t("analytics.spending")}</div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="text-sm text-muted-foreground mb-1">{t("analytics.totalSaved")}</div>
                <div className="text-2xl text-primary">{formatCurrency(totalSaved, currency)}</div>
                <div className="text-xs text-muted-foreground mt-1">{t("analytics.thisPeriod")}</div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="text-sm text-muted-foreground mb-1">{t("analytics.topCategory")}</div>
                <div className="text-lg">{topCategory ? localizeCategory(topCategory.name) : t("analytics.none")}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {topCategory ? formatCurrency(topCategory.value, currency) : t("analytics.noExpenseData")}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-primary to-[#52b788] text-white rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <TrendingUp className="size-8 flex-shrink-0" />
                  <div>
                    <h4 className="mb-2">{t("analytics.momentum")}</h4>
                    <p className="text-sm text-white/90">
                      {spendingChange <= 0
                        ? t("analytics.spendingLess", { delta: Math.abs(spendingChange).toFixed(1) })
                        : t("analytics.spendingMore", { delta: spendingChange.toFixed(1) })}{" "}
                      {t("analytics.currentSavingsRate", { rate: savingsRate })}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <TrendingDown className="size-8 flex-shrink-0 text-orange-500" />
                  <div>
                    <h4 className="mb-2 text-orange-900">{t("analytics.watchOut")}</h4>
                    <p className="text-sm text-orange-800">
                      {overBudgetCategory
                        ? t("analytics.overBudget", {
                            category: localizeCategory(overBudgetCategory.category),
                            amount: formatCurrency(overBudgetCategory.actual - overBudgetCategory.budget, currency),
                          })
                        : t("analytics.noCategoriesOver")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-secondary border border-border rounded-xl p-6">
              <h3 className="mb-4">{t("analytics.smartRecommendations")}</h3>
              <div className="space-y-3">
                {recommendations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("analytics.notEnoughData")}</p>
                ) : (
                  recommendations.map((item, index) => (
                    <div key={item.title} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium mb-1">{item.title}</div>
                        <p className="text-sm text-muted-foreground">{item.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="flex items-center gap-2 mb-4">
                <PieChartIcon className="size-5 text-primary" />
                <h3>{t("analytics.spendingDistribution")}</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart key={`analytics-spending-pie-${timePeriod}`}>
                    <Pie
                      data={categoryData.length ? categoryData : [{ name: t("analytics.noExpensesPie"), value: 1, color: "#d9f0b3", percentage: 100 }]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {(categoryData.length ? categoryData : [{ name: t("analytics.noExpensesPie"), value: 1, color: "#d9f0b3", percentage: 100 }]).map((entry, index) => (
                        <Cell key={`analytics-spending-cell-${entry.name}-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value), currency)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {categoryData.map((category, index) => (
                    <div key={`analytics-legend-${category.name}-${index}`} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                          <span>{localizeCategory(category.name)}</span>
                        </div>
                        <span className="font-medium">{formatCurrency(category.value, currency)}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            backgroundColor: category.color,
                            width: `${category.percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="size-5 text-primary" />
                <h3>{t("analytics.sixMonthTrend")}</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyComparison}>
                  <defs>
                    <linearGradient id="analytics-colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2d6a4f" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2d6a4f" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="analytics-colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4183d" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#d4183d" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#52796f" />
                  <YAxis stroke="#52796f" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #95d5b2",
                      borderRadius: "8px",
                    }}
                  />
                  <Area type="monotone" dataKey="income" stroke="#2d6a4f" fillOpacity={1} fill="url(#analytics-colorIncome)" />
                  <Area type="monotone" dataKey="expenses" stroke="#d4183d" fillOpacity={1} fill="url(#analytics-colorExpenses)" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: "#2d6a4f" }} />
                  <span className="text-sm text-muted-foreground">{t("home.income")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: "#d4183d" }} />
                  <span className="text-sm text-muted-foreground">{t("home.expenses")}</span>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="size-5 text-primary" />
                <h3>{t("analytics.dailySpendingPattern")}</h3>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dailySpending}>
                  <XAxis dataKey="day" stroke="#52796f" fontSize={12} />
                  <YAxis stroke="#52796f" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #95d5b2",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => formatCurrency(Number(value), currency)}
                  />
                  <Line type="monotone" dataKey="amount" stroke="#2d6a4f" strokeWidth={2} dot={{ fill: "#2d6a4f", r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <h3 className="mb-4">{t("analytics.budgetVsActual")}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={budgetComparison}>
                    <XAxis dataKey="category" stroke="#52796f" fontSize={12} />
                    <YAxis stroke="#52796f" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #95d5b2",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="budget" fill="#95d5b2" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="actual" fill="#2d6a4f" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <h3 className="mb-4">{t("analytics.categoryTrends")}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={categoryTrends}>
                    <XAxis dataKey="month" stroke="#52796f" />
                    <YAxis stroke="#52796f" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #95d5b2",
                        borderRadius: "8px",
                      }}
                    />
                    {trackedTrendCategories.map((category, index) => (
                      <Line
                        key={category.id}
                        type="monotone"
                        dataKey={category.name.toLowerCase()}
                        stroke={CHART_COLORS[index % CHART_COLORS.length]}
                        strokeWidth={2}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {trackedTrendCategories.map((category, index) => (
                    <div key={category.id} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                      <span className="text-sm text-muted-foreground">{localizeCategory(category.name)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
