import { useState } from "react";
import { Link } from "react-router";
import { 
  ArrowLeft, 
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
  CalendarDays
} from "lucide-react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import Layout from "../components/Layout";
import DateFilter from "../components/DateFilter";

interface Transaction {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
  isRecurring?: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export default function Transactions() {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([
    // Income
    { id: '1', name: 'Part-time Job', amount: 1200, category: 'Job', date: 'Mar 1, 2026', type: 'income', isRecurring: true, recurringFrequency: 'monthly' },
    { id: '2', name: 'Scholarship', amount: 600, category: 'Scholarship', date: 'Mar 1, 2026', type: 'income', isRecurring: true, recurringFrequency: 'monthly' },
    { id: '15', name: 'Freelance Project', amount: 250, category: 'Job', date: 'Feb 28, 2026', type: 'income' },
    { id: '16', name: 'Birthday Gift', amount: 100, category: 'Gift', date: 'Feb 25, 2026', type: 'income' },
    
    // Expenses
    { id: '3', name: 'Textbooks', amount: 150, category: 'Books', date: 'Mar 3, 2026', type: 'expense' },
    { id: '4', name: 'Groceries', amount: 85.50, category: 'Food', date: 'Mar 5, 2026', type: 'expense', isRecurring: true, recurringFrequency: 'weekly' },
    { id: '5', name: 'Bus Pass', amount: 50, category: 'Transport', date: 'Mar 7, 2026', type: 'expense', isRecurring: true, recurringFrequency: 'monthly' },
    { id: '6', name: 'Coffee', amount: 24, category: 'Entertainment', date: 'Mar 8, 2026', type: 'expense', isRecurring: true, recurringFrequency: 'daily' },
    { id: '7', name: 'Lunch', amount: 40, category: 'Food', date: 'Mar 10, 2026', type: 'expense' },
    { id: '8', name: 'Movie Night', amount: 200, category: 'Entertainment', date: 'Mar 12, 2026', type: 'expense' },
    { id: '9', name: 'Gym Membership', amount: 30, category: 'Other', date: 'Mar 1, 2026', type: 'expense', isRecurring: true, recurringFrequency: 'monthly' },
    { id: '10', name: 'Study Materials', amount: 45, category: 'Books', date: 'Feb 28, 2026', type: 'expense' },
    { id: '11', name: 'Restaurant', amount: 55, category: 'Food', date: 'Feb 27, 2026', type: 'expense' },
    { id: '12', name: 'Uber', amount: 25, category: 'Transport', date: 'Feb 26, 2026', type: 'expense' },
    { id: '13', name: 'Concert Tickets', amount: 80, category: 'Entertainment', date: 'Feb 24, 2026', type: 'expense' },
    { id: '14', name: 'Stationery', amount: 22.50, category: 'Books', date: 'Feb 23, 2026', type: 'expense' },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const categories = ['Food', 'Books', 'Transport', 'Entertainment', 'Job', 'Scholarship', 'Gift', 'Other'];

  const getCategoryIcon = (category: string, type: string) => {
    if (type === 'income') {
      return <TrendingUp className="size-4" />;
    }
    
    switch (category.toLowerCase()) {
      case 'food':
        return <Utensils className="size-4" />;
      case 'books':
        return <Book className="size-4" />;
      case 'transport':
        return <Bus className="size-4" />;
      case 'entertainment':
        return <Film className="size-4" />;
      default:
        return <ShoppingCart className="size-4" />;
    }
  };

  // Filter transactions
  const filteredTransactions = allTransactions.filter((transaction) => {
    // Search filter
    if (searchQuery && !transaction.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Type filter
    if (selectedType !== 'all' && transaction.type !== selectedType) {
      return false;
    }

    // Category filter
    if (selectedCategory !== 'all' && transaction.category !== selectedCategory) {
      return false;
    }

    // Amount range filter
    if (minAmount && transaction.amount < parseFloat(minAmount)) {
      return false;
    }
    if (maxAmount && transaction.amount > parseFloat(maxAmount)) {
      return false;
    }

    // Date range filter
    if (selectedDateRange !== 'all') {
      const transactionDate = new Date(transaction.date);
      const today = new Date('Mar 14, 2026');
      const daysDiff = Math.floor((today.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24));

      if (selectedDateRange === 'week' && daysDiff > 7) return false;
      if (selectedDateRange === 'month' && daysDiff > 30) return false;
      if (selectedDateRange === 'quarter' && daysDiff > 90) return false;
    }

    // Specific date filter
    if (selectedDate) {
      const transactionDate = new Date(transaction.date);
      const selectedDateObj = new Date(selectedDate);
      if (transactionDate.toDateString() !== selectedDateObj.toDateString()) {
        return false;
      }
    }

    return true;
  });

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const clearFilters = () => {
    setSelectedType('all');
    setSelectedCategory('all');
    setSelectedDateRange('all');
    setMinAmount('');
    setMaxAmount('');
    setSearchQuery('');
    setSelectedDate(undefined);
  };

  const hasActiveFilters = selectedType !== 'all' || 
                           selectedCategory !== 'all' || 
                           selectedDateRange !== 'all' ||
                           minAmount !== '' ||
                           maxAmount !== '' ||
                           searchQuery !== '' ||
                           selectedDate !== undefined;

  const handleExportCSV = () => {
    const csvData = [
      ['Name', 'Amount', 'Category', 'Type', 'Date'],
      ...filteredTransactions.map(t => [
        t.name,
        t.amount.toString(),
        t.category,
        t.type,
        t.date
      ])
    ];
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pandabudget-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const jsonData = {
      exportDate: new Date().toISOString(),
      totalIncome,
      totalExpenses,
      transactions: filteredTransactions
    };
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pandabudget-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const startEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setEditName(transaction.name);
    setEditAmount(transaction.amount.toString());
    setEditCategory(transaction.category);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditAmount('');
    setEditCategory('');
  };

  const saveEdit = (id: string) => {
    setAllTransactions(allTransactions.map(t => 
      t.id === id 
        ? { ...t, name: editName, amount: parseFloat(editAmount) || t.amount, category: editCategory }
        : t
    ));
    cancelEdit();
  };

  const deleteTransaction = (id: string) => {
    setAllTransactions(allTransactions.filter(t => t.id !== id));
    setDeleteConfirmId(null);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-input-background pl-11 pr-4 py-3 rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Date Filter - Prominent */}
        <div className="mb-6">
          <DateFilter selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link
            to="/recurring"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-card border border-border rounded-lg hover:bg-secondary transition-colors"
          >
            <Repeat className="size-5 text-primary" />
            <span>Recurring Transactions</span>
          </Link>
          <div className="relative group">
            <button
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              <Download className="size-5" />
              <span>Export Data</span>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={handleExportCSV}
                className="w-full px-4 py-3 text-left hover:bg-secondary rounded-t-lg transition-colors flex items-center gap-2"
              >
                <Download className="size-4" />
                Export as CSV
              </button>
              <button
                onClick={handleExportJSON}
                className="w-full px-4 py-3 text-left hover:bg-secondary rounded-b-lg transition-colors flex items-center gap-2"
              >
                <Download className="size-4" />
                Export as JSON
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="text-sm text-muted-foreground mb-1">Total</div>
            <div className="text-2xl">{filteredTransactions.length}</div>
            <div className="text-xs text-muted-foreground">transactions</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
              <TrendingUp className="size-3" />
              Income
            </div>
            <div className="text-2xl text-primary">${totalIncome.toFixed(2)}</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
              <TrendingDown className="size-3" />
              Expenses
            </div>
            <div className="text-2xl text-destructive">${totalExpenses.toFixed(2)}</div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-accent transition-colors mb-4"
          >
            <Filter className="size-4" />
            Filters
            <ChevronDown className={`size-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                Active
              </span>
            )}
          </button>

          {showFilters && (
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              {/* Type Filter */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Transaction Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setSelectedType('all')}
                    className={`py-2 rounded-lg transition-all ${
                      selectedType === 'all'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setSelectedType('income')}
                    className={`py-2 rounded-lg transition-all ${
                      selectedType === 'income'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    Income
                  </button>
                  <button
                    onClick={() => setSelectedType('expense')}
                    className={`py-2 rounded-lg transition-all ${
                      selectedType === 'expense'
                        ? 'bg-destructive text-destructive-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    Expense
                  </button>
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block flex items-center gap-1">
                  <Calendar className="size-4" />
                  Date Range
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => setSelectedDateRange('all')}
                    className={`py-2 rounded-lg text-sm transition-all ${
                      selectedDateRange === 'all'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    All Time
                  </button>
                  <button
                    onClick={() => setSelectedDateRange('week')}
                    className={`py-2 rounded-lg text-sm transition-all ${
                      selectedDateRange === 'week'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    Last Week
                  </button>
                  <button
                    onClick={() => setSelectedDateRange('month')}
                    className={`py-2 rounded-lg text-sm transition-all ${
                      selectedDateRange === 'month'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    Last Month
                  </button>
                  <button
                    onClick={() => setSelectedDateRange('quarter')}
                    className={`py-2 rounded-lg text-sm transition-all ${
                      selectedDateRange === 'quarter'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    Last Quarter
                  </button>
                </div>
              </div>

              {/* Amount Range Filter */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block flex items-center gap-1">
                  <DollarSign className="size-4" />
                  Amount Range
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="number"
                      placeholder="Min amount"
                      value={minAmount}
                      onChange={(e) => setMinAmount(e.target.value)}
                      className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Max amount"
                      value={maxAmount}
                      onChange={(e) => setMaxAmount(e.target.value)}
                      className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <X className="size-4" />
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Transactions List */}
        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <ShoppingCart className="size-12 mx-auto text-muted-foreground/50 mb-3" />
              <h3 className="mb-2">No transactions found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or search query
              </p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                {editingId === transaction.id ? (
                  // Edit mode
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        transaction.type === 'income' 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-accent text-accent-foreground'
                      }`}>
                        {getCategoryIcon(transaction.category, transaction.type)}
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Name"
                          className="px-3 py-2 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <input
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          placeholder="Amount"
                          className="px-3 py-2 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="px-3 py-2 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="all">Select Category</option>
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
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
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-secondary transition-colors"
                      >
                        <X className="size-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : deleteConfirmId === transaction.id ? (
                  // Delete confirmation mode
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Trash2 className="size-6 text-destructive" />
                      <div>
                        <div className="font-medium text-destructive">Delete this transaction?</div>
                        <div className="text-sm text-muted-foreground">This action cannot be undone.</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => deleteTransaction(transaction.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-opacity"
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-secondary transition-colors"
                      >
                        <X className="size-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // Normal display mode
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        transaction.type === 'income' 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-accent text-accent-foreground'
                      }`}>
                        {getCategoryIcon(transaction.category, transaction.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{transaction.name}</span>
                          {transaction.isRecurring && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full border border-primary/20" title={`Recurring ${transaction.recurringFrequency}`}>
                              <Repeat className="size-3" />
                              {transaction.recurringFrequency}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">{transaction.category}</div>
                        <div className="text-xs text-muted-foreground mt-1">{transaction.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`text-lg ${
                        transaction.type === 'income' ? 'text-primary' : 'text-foreground'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(transaction)}
                          className="p-2 bg-muted text-muted-foreground rounded-lg hover:bg-secondary transition-colors"
                          title="Edit transaction"
                        >
                          <Edit2 className="size-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(transaction.id)}
                          className="p-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors"
                          title="Delete transaction"
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

        {/* Results Summary */}
        {filteredTransactions.length > 0 && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Showing {filteredTransactions.length} of {allTransactions.length} transactions
          </div>
        )}
      </div>
    </Layout>
  );
}