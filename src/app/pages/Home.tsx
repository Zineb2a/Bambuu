import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Target,
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
import { formatCurrency, formatCurrencyWithCode } from "../lib/currency";
import { getSavingsGoalAmountsInCurrency, listSavingsGoals } from "../lib/finance";
import {
  formatTransactionDate,
  getTransactionAmountInCurrency,
  listTransactions,
  parseTransactionDate,
} from "../lib/transactions";
import { useAuth } from "../providers/AuthProvider";
import { useI18n } from "../providers/I18nProvider";
import type { SavingsGoal } from "../types/finance";
import type { Transaction } from "../types/transactions";

const CHART_COLORS = ["#2d6a4f", "#52b788", "#74c69d", "#95d5b2", "#b7e4c7", "#40916c"];

export default function Home() {
  const { user } = useAuth();
  const { t, localizeCategory } = useI18n();
  const currency = useUserCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<"week" | "month" | "year">("month");

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setGoals([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadTransactions = async () => {
      setIsLoading(true);

      try {
        const [transactionData, goalData] = await Promise.all([
          listTransactions(user.id),
          listSavingsGoals(user.id),
        ]);
        if (isMounted) {
          setTransactions(transactionData);
          setGoals(goalData);
        }
      } catch {
        if (isMounted) {
          setTransactions([]);
          setGoals([]);
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
            </div>

            <div className="relative flex-1 w-16 min-h-[400px] rounded-full overflow-hidden bg-[#E8D7B8] shadow-inner border-2 border-[#D4C5A9]">
              <div className="absolute top-[15%] w-full h-2 bg-[#8B7355] opacity-40"></div>
              <div className="absolute top-[30%] w-full h-2 bg-[#8B7355] opacity-40"></div>
              <div className="absolute top-[45%] w-full h-2 bg-[#8B7355] opacity-40"></div>
              <div className="absolute top-[60%] w-full h-2 bg-[#8B7355] opacity-40"></div>
              <div className="absolute top-[75%] w-full h-2 bg-[#8B7355] opacity-40"></div>
              <div className="absolute top-[90%] w-full h-2 bg-[#8B7355] opacity-40"></div>

              <div
                className="absolute bottom-0 w-full bg-primary transition-all duration-700 ease-out"
                style={{ height: `${savingsProgress}%` }}
              ></div>

              <div
                className="absolute left-1/2 -translate-x-1/2 transition-all duration-700 ease-out"
                style={{ bottom: `${Math.max(savingsProgress - 5, 0)}%` }}
              >
                <div className="relative" style={{ width: "80px", height: "80px" }}>
                  <svg viewBox="0 0 100 100" className="w-full h-full animate-bounce-subtle">
                    <ellipse cx="20" cy="45" rx="12" ry="16" fill="#2d2d2d" transform="rotate(-20 20 45)" />
                    <ellipse cx="80" cy="45" rx="12" ry="16" fill="#2d2d2d" transform="rotate(20 80 45)" />
                    <ellipse cx="30" cy="75" rx="13" ry="18" fill="#2d2d2d" transform="rotate(-15 30 75)" />
                    <ellipse cx="70" cy="75" rx="13" ry="18" fill="#2d2d2d" transform="rotate(15 70 75)" />
                    <ellipse cx="50" cy="55" rx="28" ry="32" fill="#f0f0f0" />
                    <circle cx="50" cy="30" r="22" fill="#f0f0f0" />
                    <circle cx="35" cy="18" r="9" fill="#2d2d2d" />
                    <circle cx="65" cy="18" r="9" fill="#2d2d2d" />
                    <ellipse cx="42" cy="28" rx="7" ry="9" fill="#2d2d2d" transform="rotate(-15 42 28)" />
                    <ellipse cx="58" cy="28" rx="7" ry="9" fill="#2d2d2d" transform="rotate(15 58 28)" />
                    <circle cx="42" cy="28" r="3" fill="#ffffff" />
                    <circle cx="58" cy="28" r="3" fill="#ffffff" />
                    <ellipse cx="50" cy="36" rx="4" ry="3" fill="#2d2d2d" />
                    <path d="M 45 38 Q 50 42 55 38" stroke="#2d2d2d" strokeWidth="2" fill="none" strokeLinecap="round" />
                    <ellipse cx="50" cy="60" rx="12" ry="14" fill="#e8e8e8" opacity="0.4" />
                  </svg>

                  <style>{`
                    @keyframes bounce-subtle {
                      0%, 100% { transform: translateY(0px) rotate(-2deg); }
                      50% { transform: translateY(-3px) rotate(2deg); }
                    }
                    .animate-bounce-subtle {
                      animation: bounce-subtle 2s ease-in-out infinite;
                    }
                  `}</style>
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
      </div>
    </Layout>
  );
}
