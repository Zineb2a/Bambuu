import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  Filter,
  Search,
  ShoppingCart,
  Utensils,
  Bus,
  Film,
  Book,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  X,
  ChevronDown,
  Download,
  Edit2,
  Check,
  Repeat,
  Trash2,
} from "lucide-react";
import Layout from "../components/Layout";
import DateFilter from "../components/DateFilter";
import { useUserCurrency } from "../hooks/useUserCurrency";
import { formatCurrency, formatCurrencyWithCode } from "../lib/currency";
import {
  formatTransactionDate,
  getTransactionAmountInCurrency,
  listTransactions,
  parseTransactionDate,
  removeTransaction,
  updateTransaction,
} from "../lib/transactions";
import { useAuth } from "../providers/AuthProvider";
import { useI18n } from "../providers/I18nProvider";
import type { Transaction } from "../types/transactions";

export default function Transactions() {
  const { user } = useAuth();
  const { t, localizeCategory, localizeFrequency } = useI18n();
  const currency = useUserCurrency();
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "income" | "expense">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDateRange, setSelectedDateRange] = useState<string>("all");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const categories = ["Food", "Books", "Transport", "Entertainment", "Job", "Scholarship", "Gift", "Other"];

  useEffect(() => {
    if (!user) {
      setAllTransactions([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadTransactions = async () => {
      setIsLoading(true);

      try {
        const data = await listTransactions(user.id);
        if (isMounted) {
          setAllTransactions(data);
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

  const getCategoryIcon = (category: string, type: string) => {
    if (type === "income") {
      return <TrendingUp className="size-4" />;
    }

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

  const filteredTransactions = useMemo(
    () =>
      allTransactions.filter((transaction) => {
        if (searchQuery && !transaction.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }

        if (selectedType !== "all" && transaction.type !== selectedType) {
          return false;
        }

        if (selectedCategory !== "all" && transaction.category !== selectedCategory) {
          return false;
        }

        const convertedAmount = getTransactionAmountInCurrency(transaction, currency);

        if (minAmount && convertedAmount < parseFloat(minAmount)) {
          return false;
        }

        if (maxAmount && convertedAmount > parseFloat(maxAmount)) {
          return false;
        }

        if (selectedDateRange !== "all") {
          const transactionDate = parseTransactionDate(transaction.occurredOn);
          const today = new Date();
          const daysDiff = Math.floor(
            (today.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24),
          );

          if (selectedDateRange === "week" && daysDiff > 7) return false;
          if (selectedDateRange === "month" && daysDiff > 30) return false;
          if (selectedDateRange === "quarter" && daysDiff > 90) return false;
        }

        if (selectedDate) {
          const transactionDate = parseTransactionDate(transaction.occurredOn);
          const selectedDateObj = new Date(selectedDate);
          if (transactionDate.toDateString() !== selectedDateObj.toDateString()) {
            return false;
          }
        }

        return true;
      }),
    [
      allTransactions,
      maxAmount,
      minAmount,
      searchQuery,
      selectedCategory,
      selectedDate,
      selectedDateRange,
      selectedType,
      currency,
    ],
  );

  const totalIncome = filteredTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + getTransactionAmountInCurrency(transaction, currency), 0);

  const totalExpenses = filteredTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + getTransactionAmountInCurrency(transaction, currency), 0);

  const clearFilters = () => {
    setSelectedType("all");
    setSelectedCategory("all");
    setSelectedDateRange("all");
    setMinAmount("");
    setMaxAmount("");
    setSearchQuery("");
    setSelectedDate(undefined);
  };

  const hasActiveFilters =
    selectedType !== "all" ||
    selectedCategory !== "all" ||
    selectedDateRange !== "all" ||
    minAmount !== "" ||
    maxAmount !== "" ||
    searchQuery !== "" ||
    selectedDate !== undefined;

  const handleExportCSV = () => {
    const csvData = [
      ["Name", "Amount", "Display Currency", "Original Amount", "Original Currency", "Category", "Type", "Date"],
      ...filteredTransactions.map((transaction) => [
        transaction.name,
        getTransactionAmountInCurrency(transaction, currency).toString(),
        currency,
        transaction.originalAmount.toString(),
        transaction.currency,
        transaction.category,
        transaction.type,
        transaction.occurredOn,
      ]),
    ];
    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pandabudget-transactions-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const jsonData = {
      exportDate: new Date().toISOString(),
      totalIncome,
      totalExpenses,
      transactions: filteredTransactions,
    };
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pandabudget-data-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const startEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setEditName(transaction.name);
    setEditAmount(transaction.originalAmount.toString());
    setEditCategory(transaction.category);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditAmount("");
    setEditCategory("");
  };

  const saveEdit = async (id: string) => {
    if (!user) {
      return;
    }

    const updated = await updateTransaction(user.id, id, {
      name: editName,
      amount:
        editAmount !== ""
          ? getTransactionAmountInCurrency(
              {
                ...allTransactions.find((transaction) => transaction.id === id)!,
                originalAmount: parseFloat(editAmount),
              },
              currency,
            )
          : undefined,
      originalAmount: parseFloat(editAmount) || undefined,
      category: editCategory,
    });

    setAllTransactions(
      allTransactions.map((transaction) => (transaction.id === id ? updated : transaction)),
    );
    cancelEdit();
    window.dispatchEvent(new Event("transactionsChanged"));
  };

  const deleteTransaction = async (id: string) => {
    if (!user) {
      return;
    }

    await removeTransaction(user.id, id);
    setAllTransactions(allTransactions.filter((transaction) => transaction.id !== id));
    setDeleteConfirmId(null);
    window.dispatchEvent(new Event("transactionsChanged"));
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("transactions.search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-input-background pl-11 pr-4 py-3 rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="mb-6">
          <DateFilter selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link
            to="/recurring"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-card border border-border rounded-lg hover:bg-secondary transition-colors"
          >
            <Repeat className="size-5 text-primary" />
            <span>{t("transactions.recurringTransactions")}</span>
          </Link>
          <div className="relative group">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
              <Download className="size-5" />
              <span>{t("transactions.exportData")}</span>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={handleExportCSV}
                className="w-full px-4 py-3 text-left hover:bg-secondary rounded-t-lg transition-colors flex items-center gap-2"
              >
                <Download className="size-4" />
                {t("transactions.exportCsv")}
              </button>
              <button
                onClick={handleExportJSON}
                className="w-full px-4 py-3 text-left hover:bg-secondary rounded-b-lg transition-colors flex items-center gap-2"
              >
                <Download className="size-4" />
                {t("transactions.exportJson")}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="text-sm text-muted-foreground mb-1">{t("transactions.total")}</div>
            <div className="text-2xl">{filteredTransactions.length}</div>
            <div className="text-xs text-muted-foreground">{t("transactions.transactionsSuffix")}</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
              <TrendingUp className="size-3" />
              {t("home.income")}
            </div>
            <div className="text-2xl text-primary">{formatCurrency(totalIncome, currency)}</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
              <TrendingDown className="size-3" />
              {t("home.expenses")}
            </div>
            <div className="text-2xl text-destructive">{formatCurrency(totalExpenses, currency)}</div>
          </div>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-accent transition-colors mb-4"
          >
            <Filter className="size-4" />
            {t("transactions.filters")}
            <ChevronDown className={`size-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            {hasActiveFilters ? (
              <span className="ml-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                {t("transactions.active")}
              </span>
            ) : null}
          </button>

          {showFilters ? (
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">{t("transactions.transactionType")}</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setSelectedType("all")}
                    className={`py-2 rounded-lg transition-all ${
                      selectedType === "all"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {t("common.all")}
                  </button>
                  <button
                    onClick={() => setSelectedType("income")}
                    className={`py-2 rounded-lg transition-all ${
                      selectedType === "income"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {t("home.income")}
                  </button>
                  <button
                    onClick={() => setSelectedType("expense")}
                    className={`py-2 rounded-lg transition-all ${
                      selectedType === "expense"
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-muted text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {t("addTransaction.expense")}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">{t("transactions.category")}</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">{t("transactions.allCategories")}</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {localizeCategory(category)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block flex items-center gap-1">
                  <Calendar className="size-4" />
                  {t("transactions.dateRange")}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => setSelectedDateRange("all")}
                    className={`py-2 rounded-lg text-sm transition-all ${
                      selectedDateRange === "all"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {t("transactions.allTime")}
                  </button>
                  <button
                    onClick={() => setSelectedDateRange("week")}
                    className={`py-2 rounded-lg text-sm transition-all ${
                      selectedDateRange === "week"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {t("transactions.lastWeek")}
                  </button>
                  <button
                    onClick={() => setSelectedDateRange("month")}
                    className={`py-2 rounded-lg text-sm transition-all ${
                      selectedDateRange === "month"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {t("transactions.lastMonth")}
                  </button>
                  <button
                    onClick={() => setSelectedDateRange("quarter")}
                    className={`py-2 rounded-lg text-sm transition-all ${
                      selectedDateRange === "quarter"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {t("transactions.lastQuarter")}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block flex items-center gap-1">
                  <DollarSign className="size-4" />
                  {t("transactions.amountRange")}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder={t("transactions.minAmount")}
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <input
                    type="number"
                    placeholder={t("transactions.maxAmount")}
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                    className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {hasActiveFilters ? (
                <button
                  onClick={clearFilters}
                  className="w-full py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <X className="size-4" />
                  {t("transactions.clearAllFilters")}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <h3 className="mb-2">{t("transactions.loadingTitle")}</h3>
              <p className="text-sm text-muted-foreground">{t("transactions.loadingDescription")}</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <ShoppingCart className="size-12 mx-auto text-muted-foreground/50 mb-3" />
              <h3 className="mb-2">{t("transactions.emptyTitle")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("transactions.emptyDescription")}
              </p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                {editingId === transaction.id ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        transaction.type === "income"
                          ? "bg-primary/10 text-primary"
                          : "bg-accent text-accent-foreground"
                      }`}>
                        {getCategoryIcon(transaction.category, transaction.type)}
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder={t("transactions.name")}
                          className="px-3 py-2 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <input
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          placeholder={t("transactions.amount")}
                          className="px-3 py-2 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="px-3 py-2 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="">{t("transactions.selectCategory")}</option>
                          {categories.map((category) => (
                            <option key={category} value={category}>
                              {localizeCategory(category)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => saveEdit(transaction.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                      >
                        <Check className="size-4" />
                        {t("transactions.save")}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-secondary transition-colors"
                      >
                        <X className="size-4" />
                        {t("common.cancel")}
                      </button>
                    </div>
                  </div>
                ) : deleteConfirmId === transaction.id ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Trash2 className="size-6 text-destructive" />
                      <div>
                        <div className="font-medium text-destructive">{t("transactions.deletePrompt")}</div>
                        <div className="text-sm text-muted-foreground">{t("transactions.deleteDescription")}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => deleteTransaction(transaction.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-opacity"
                      >
                        <Trash2 className="size-4" />
                        {t("common.delete")}
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-secondary transition-colors"
                      >
                        <X className="size-4" />
                        {t("common.cancel")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        transaction.type === "income"
                          ? "bg-primary/10 text-primary"
                          : "bg-accent text-accent-foreground"
                      }`}>
                        {getCategoryIcon(transaction.category, transaction.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{transaction.name}</span>
                          {transaction.isRecurring ? (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full border border-primary/20"
                              title={t("transactions.recurringTitle", {
                                frequency: localizeFrequency(transaction.recurringFrequency ?? "monthly"),
                              })}
                            >
                              <Repeat className="size-3" />
                              {localizeFrequency(transaction.recurringFrequency ?? "monthly")}
                            </span>
                          ) : null}
                        </div>
                        <div className="text-sm text-muted-foreground">{localizeCategory(transaction.category)}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatTransactionDate(transaction.occurredOn)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t("common.paidIn", {
                            amount: formatCurrencyWithCode(transaction.originalAmount, transaction.currency),
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={transaction.type === "income" ? "text-lg text-primary" : "text-lg text-foreground"}>
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(getTransactionAmountInCurrency(transaction, currency), currency)}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(transaction)}
                          className="p-2 bg-muted text-muted-foreground rounded-lg hover:bg-secondary transition-colors"
                          title={t("transactions.editTitle")}
                        >
                          <Edit2 className="size-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(transaction.id)}
                          className="p-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors"
                          title={t("transactions.deleteTitle")}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {filteredTransactions.length > 0 ? (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {t("transactions.showingCount", {
              shown: filteredTransactions.length,
              total: allTransactions.length,
            })}
          </div>
        ) : null}
      </div>
    </Layout>
  );
}
