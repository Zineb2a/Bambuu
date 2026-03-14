import { useEffect, useMemo, useState } from "react";
import { Briefcase, DollarSign, TrendingUp } from "lucide-react";
import Layout from "../components/Layout";
import { useUserCurrency } from "../hooks/useUserCurrency";
import { formatCurrency, formatCurrencyWithCode } from "../lib/currency";
import { formatTransactionDate, getTransactionAmountInCurrency, listTransactions } from "../lib/transactions";
import { useAuth } from "../providers/AuthProvider";
import type { Transaction } from "../types/transactions";

export default function Income() {
  const { user } = useAuth();
  const currency = useUserCurrency();
  const [incomeStreams, setIncomeStreams] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIncomeStreams([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadIncome = async () => {
      setIsLoading(true);
      try {
        const data = await listTransactions(user.id);
        if (isMounted) {
          setIncomeStreams(data.filter((transaction) => transaction.type === "income"));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadIncome();
    window.addEventListener("transactionsChanged", loadIncome);

    return () => {
      isMounted = false;
      window.removeEventListener("transactionsChanged", loadIncome);
    };
  }, [user]);

  const totalIncome = useMemo(
    () => incomeStreams.reduce((sum, income) => sum + getTransactionAmountInCurrency(income, currency), 0),
    [currency, incomeStreams],
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-gradient-to-br from-primary to-[#52b788] text-white rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex items-center gap-2 mb-2 opacity-90">
            <TrendingUp className="size-5" />
            <span className="text-sm">Total Income</span>
          </div>
          <div className="text-4xl">{formatCurrency(totalIncome, currency)}</div>
        </div>

        <h3 className="mb-4">Income Sources</h3>
        <div className="space-y-3">
          {isLoading ? (
            <div className="bg-card border border-border rounded-xl p-6 text-sm text-muted-foreground">
              Loading income...
            </div>
          ) : incomeStreams.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-6 text-sm text-muted-foreground">
              No income transactions yet.
            </div>
          ) : (
            incomeStreams.map((income) => (
              <div key={income.id} className="bg-card border border-border rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      <Briefcase className="size-5" />
                    </div>
                    <div>
                      <div className="font-medium">{income.name}</div>
                      <div className="text-sm text-muted-foreground">{income.category}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatTransactionDate(income.occurredOn)} • Paid in {formatCurrencyWithCode(income.originalAmount, income.currency)}
                      </div>
                    </div>
                  </div>
                  <div className="text-lg text-primary">+{formatCurrency(getTransactionAmountInCurrency(income, currency), currency)}</div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 bg-secondary border border-border rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary flex-shrink-0">
              <DollarSign className="size-5" />
            </div>
            <div>
              <h4 className="mb-2">Income Snapshot</h4>
              <p className="text-sm text-muted-foreground">
                This page is now driven by your real income transactions. Add more income entries from the global + button to keep it current.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
