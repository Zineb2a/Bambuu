import { useEffect, useMemo, useState } from "react";
import { Filter, Search, ShoppingCart, Utensils, Bus, Film, Book } from "lucide-react";
import Layout from "../components/Layout";
import { useUserCurrency } from "../hooks/useUserCurrency";
import { formatCurrency, formatCurrencyWithCode } from "../lib/currency";
import { formatTransactionDate, getTransactionAmountInCurrency, listTransactions } from "../lib/transactions";
import { useAuth } from "../providers/AuthProvider";
import { useI18n } from "../providers/I18nProvider";
import type { Transaction } from "../types/transactions";

export default function Expenses() {
  const { user } = useAuth();
  const { t, localizeCategory } = useI18n();
  const currency = useUserCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadExpenses = async () => {
      setIsLoading(true);
      try {
        const data = await listTransactions(user.id);
        if (isMounted) {
          setTransactions(data.filter((transaction) => transaction.type === "expense"));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadExpenses();
    window.addEventListener("transactionsChanged", loadExpenses);

    return () => {
      isMounted = false;
      window.removeEventListener("transactionsChanged", loadExpenses);
    };
  }, [user]);

  const filteredExpenses = useMemo(
    () =>
      transactions.filter((expense) =>
        expense.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [searchQuery, transactions],
  );

  const totalExpenses = filteredExpenses.reduce(
    (sum, expense) => sum + getTransactionAmountInCurrency(expense, currency),
    0,
  );

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
      default:
        return <ShoppingCart className="size-4" />;
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("expensesPage.search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-input-background pl-11 pr-4 py-3 rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-sm text-muted-foreground">{t("expensesPage.totalExpenses")}</div>
            <div className="text-3xl text-foreground">{formatCurrency(totalExpenses, currency)}</div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg">
            <Filter className="size-4" />
            {t("expensesPage.items", { count: filteredExpenses.length })}
          </div>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <div className="bg-card border border-border rounded-xl p-6 text-sm text-muted-foreground">
              {t("expensesPage.loading")}
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-6 text-sm text-muted-foreground">
              {t("expensesPage.empty")}
            </div>
          ) : (
            filteredExpenses.map((expense) => (
              <div key={expense.id} className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-accent-foreground">
                      {getCategoryIcon(expense.category)}
                    </div>
                    <div>
                      <div className="font-medium">{expense.name}</div>
                      <div className="text-sm text-muted-foreground">{localizeCategory(expense.category)}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatTransactionDate(expense.occurredOn)} • {t("common.paidIn", {
                          amount: formatCurrencyWithCode(expense.originalAmount, expense.currency),
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="text-lg">-{formatCurrency(getTransactionAmountInCurrency(expense, currency), currency)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
