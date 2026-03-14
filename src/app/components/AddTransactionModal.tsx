import { useEffect, useState } from "react";
import { X, DollarSign, Calendar, Tag, FileText, Repeat, Globe } from "lucide-react";
import { convertCurrency, EXCHANGE_RATES } from "../lib/currency";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: {
    name: string;
    amount: number;
    category: string;
    type: 'income' | 'expense';
    occurredOn: string;
    currency?: string;
    originalAmount?: number;
    isRecurring?: boolean;
    recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  }) => Promise<void>;
  defaultCurrency?: string;
  exchangeRates?: { [key: string]: number };
}

export default function AddTransactionModal({ isOpen, onClose, onAddTransaction, defaultCurrency = 'USD', exchangeRates }: AddTransactionModalProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCurrency, setSelectedCurrency] = useState(defaultCurrency);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setSelectedCurrency(defaultCurrency);
  }, [defaultCurrency]);

  const expenseCategories = ['Food', 'Books', 'Transport', 'Entertainment', 'Shopping', 'Other'];
  const incomeCategories = ['Job', 'Scholarship', 'Allowance', 'Gift', 'Other'];

  // Default exchange rates if none provided
  const rates = exchangeRates || EXCHANGE_RATES;

  const currencySymbols: { [key: string]: string } = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'CAD': 'C$',
    'AUD': 'A$',
    'JPY': '¥',
    'CNY': '¥',
  };

  // Convert amount from selected currency to default currency
  const convertToDefaultCurrency = (value: number, fromCurrency: string): number => {
    return convertCurrency(value, fromCurrency, defaultCurrency);
  };

  // Calculate converted amount for display
  const getConvertedAmount = (): string => {
    if (!amount || selectedCurrency === defaultCurrency) return '';
    const convertedValue = convertToDefaultCurrency(parseFloat(amount), selectedCurrency);
    return convertedValue.toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !amount || !category) {
      alert('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const parsedAmount = parseFloat(amount);
      const convertedAmount = convertToDefaultCurrency(parsedAmount, selectedCurrency);

      await onAddTransaction({
        name,
        amount: convertedAmount,
        category,
        type,
        occurredOn: date,
        currency: selectedCurrency,
        originalAmount: parsedAmount,
        isRecurring,
        recurringFrequency
      });

      setName('');
      setAmount('');
      setCategory('');
      setDate(new Date().toISOString().split('T')[0]);
      setSelectedCurrency(defaultCurrency);
      setIsRecurring(false);
      setRecurringFrequency('monthly');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-primary text-primary-foreground px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-white">Add Transaction</h2>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-3 rounded-lg transition-all ${
                type === 'expense'
                  ? 'bg-destructive text-destructive-foreground shadow-md'
                  : 'bg-muted text-muted-foreground hover:bg-secondary'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-3 rounded-lg transition-all ${
                type === 'income'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted text-muted-foreground hover:bg-secondary'
              }`}
            >
              Income
            </button>
          </div>

          {/* Name */}
          <div>
            <label className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
              <FileText className="size-4" />
              Description
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type === 'expense' ? 'e.g., Coffee' : 'e.g., Part-time Job'}
              className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
              <DollarSign className="size-4" />
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">{currencySymbols[selectedCurrency]}</span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
              <Tag className="size-4" />
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              required
            >
              <option value="">Select category</option>
              {(type === 'expense' ? expenseCategories : incomeCategories).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
              <Calendar className="size-4" />
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              required
            />
          </div>

          {/* Currency Selector */}
          <div>
            <label className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
              <Globe className="size-4" />
              Payment Currency
            </label>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              {Object.keys(rates).map((cur) => (
                <option key={cur} value={cur}>
                  {cur} ({currencySymbols[cur]})
                </option>
              ))}
            </select>
            
            {/* Conversion Preview */}
            {selectedCurrency !== defaultCurrency && amount && parseFloat(amount) > 0 && (
              <div className="mt-3 p-3 bg-gradient-to-r from-primary/10 to-[#52b788]/10 border border-primary/20 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Converted to {defaultCurrency}:</div>
                <div className="text-lg text-primary">
                  {currencySymbols[selectedCurrency]}{amount} {selectedCurrency} = {currencySymbols[defaultCurrency]}{getConvertedAmount()} {defaultCurrency}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Rate: 1 {selectedCurrency} = {(rates[defaultCurrency] / rates[selectedCurrency]).toFixed(4)} {defaultCurrency}
                </div>
              </div>
            )}
          </div>

          {/* Recurring */}
          <div>
            <label className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
              <Repeat className="size-4" />
              Recurring Transaction
            </label>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-sm">Make this a recurring transaction</span>
              </label>
              
              {isRecurring && (
                <div className="pl-6">
                  <label className="text-xs text-muted-foreground mb-2 block">Frequency</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((freq) => (
                      <button
                        key={freq}
                        type="button"
                        onClick={() => setRecurringFrequency(freq)}
                        className={`py-2 px-3 rounded-lg text-sm capitalize transition-all ${
                          recurringFrequency === freq
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'bg-muted text-muted-foreground hover:bg-secondary'
                        }`}
                      >
                        {freq}
                      </button>
                    ))}
                  </div>
                  {isRecurring && (
                    <div className="mt-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        This transaction will repeat {recurringFrequency}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 rounded-lg transition-all shadow-md ${
              isSubmitting
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : type === 'expense'
                ? 'bg-destructive text-destructive-foreground hover:opacity-90'
                : 'bg-primary text-primary-foreground hover:opacity-90'
            }`}
          >
            {isSubmitting ? 'Saving...' : `Add ${type === 'expense' ? 'Expense' : 'Income'}`}
          </button>
        </form>
      </div>
    </div>
  );
}
