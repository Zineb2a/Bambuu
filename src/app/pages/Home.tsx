import { useState, useEffect } from "react";
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
  CalendarRange
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import Layout from "../components/Layout";
import DateFilter from "../components/DateFilter";

interface Transaction {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
}

export default function Home() {
  const [userName, setUserName] = useState('');
  const [balance, setBalance] = useState(1250.50);
  const [monthlyIncome, setMonthlyIncome] = useState(1800);
  const [monthlyExpenses, setMonthlyExpenses] = useState(549.50);
  
  // Savings goal progress
  const [savingsGoal] = useState(1200); // New Laptop goal
  const [currentSavings] = useState(450);
  const savingsProgress = (currentSavings / savingsGoal) * 100;

  // Time period filter state
  const [timePeriod, setTimePeriod] = useState<'week' | 'month' | 'year'>('month');

  // Get user name from localStorage
  useEffect(() => {
    const storedName = localStorage.getItem("userName") || "";
    setUserName(storedName);
  }, []);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Currency settings
  const [defaultCurrency] = useState('USD');
  const [exchangeRates] = useState({
    'USD': 1,
    'EUR': 0.92,
    'GBP': 0.79,
    'CAD': 1.35,
    'AUD': 1.52,
    'JPY': 149.50,
    'CNY': 7.24,
  });

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', name: 'Part-time Job', amount: 1200, category: 'Income', date: 'Mar 1', type: 'income' },
    { id: '2', name: 'Scholarship', amount: 600, category: 'Income', date: 'Mar 1', type: 'income' },
    { id: '3', name: 'Textbooks', amount: 150, category: 'Books', date: 'Mar 3', type: 'expense' },
    { id: '4', name: 'Groceries', amount: 85.50, category: 'Food', date: 'Mar 5', type: 'expense' },
    { id: '5', name: 'Bus Pass', amount: 50, category: 'Transport', date: 'Mar 7', type: 'expense' },
    { id: '6', name: 'Coffee', amount: 24, category: 'Entertainment', date: 'Mar 8', type: 'expense' },
    { id: '7', name: 'Lunch', amount: 40, category: 'Food', date: 'Mar 10', type: 'expense' },
    { id: '8', name: 'Movie Night', amount: 200, category: 'Entertainment', date: 'Mar 12', type: 'expense' },
  ]);

  // Expenses by category for different time periods
  const expensesByCategoryWeek = [
    { name: 'Food', value: 35, color: '#2d6a4f' },
    { name: 'Books', value: 0, color: '#52b788' },
    { name: 'Transport', value: 12, color: '#74c69d' },
    { name: 'Entertainment', value: 55, color: '#95d5b2' },
  ];

  const expensesByCategoryMonth = [
    { name: 'Food', value: 125.50, color: '#2d6a4f' },
    { name: 'Books', value: 150, color: '#52b788' },
    { name: 'Transport', value: 50, color: '#74c69d' },
    { name: 'Entertainment', value: 224, color: '#95d5b2' },
  ];

  const expensesByCategoryYear = [
    { name: 'Food', value: 1580, color: '#2d6a4f' },
    { name: 'Books', value: 850, color: '#52b788' },
    { name: 'Transport', value: 620, color: '#74c69d' },
    { name: 'Entertainment', value: 2340, color: '#95d5b2' },
  ];

  // Get the correct expenses data based on time period
  const getExpensesData = () => {
    switch (timePeriod) {
      case 'week':
        return expensesByCategoryWeek;
      case 'month':
        return expensesByCategoryMonth;
      case 'year':
        return expensesByCategoryYear;
      default:
        return expensesByCategoryMonth;
    }
  };

  const expensesByCategory = getExpensesData();

  // Time series data for different periods
  const weeklyData = [
    { period: 'Mon', income: 0, expenses: 15 },
    { period: 'Tue', income: 0, expenses: 22 },
    { period: 'Wed', income: 0, expenses: 18 },
    { period: 'Thu', income: 50, expenses: 25 },
    { period: 'Fri', income: 0, expenses: 12 },
    { period: 'Sat', income: 0, expenses: 30 },
    { period: 'Sun', income: 0, expenses: 10 },
  ];

  const monthlyData = [
    { period: 'Jan', income: 1750, expenses: 625 },
    { period: 'Feb', income: 1800, expenses: 580 },
    { period: 'Mar', income: 1800, expenses: 549.50 },
  ];

  const yearlyData = [
    { period: '2023', income: 18400, expenses: 6200 },
    { period: '2024', income: 20500, expenses: 6850 },
    { period: '2025', income: 21600, expenses: 5390 },
  ];

  // Get the correct time series data based on time period
  const getTimeSeriesData = () => {
    switch (timePeriod) {
      case 'week':
        return weeklyData;
      case 'month':
        return monthlyData;
      case 'year':
        return yearlyData;
      default:
        return monthlyData;
    }
  };

  const timeSeriesData = getTimeSeriesData();

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'food':
        return <Utensils className="size-4" />;
      case 'books':
        return <Book className="size-4" />;
      case 'transport':
        return <Bus className="size-4" />;
      case 'entertainment':
        return <Film className="size-4" />;
      case 'income':
        return <TrendingUp className="size-4" />;
      default:
        return <ShoppingCart className="size-4" />;
    }
  };

  const handleAddTransaction = (newTransaction: {
    name: string;
    amount: number;
    category: string;
    type: 'income' | 'expense';
    date: string;
    currency?: string;
    originalAmount?: number;
    isRecurring?: boolean;
    recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  }) => {
    const transaction: Transaction = {
      id: String(Date.now()),
      name: newTransaction.name,
      amount: newTransaction.amount,
      category: newTransaction.category,
      date: newTransaction.date,
      type: newTransaction.type,
    };
    
    setTransactions([transaction, ...transactions]);
    
    // Update balance and totals
    if (newTransaction.type === 'income') {
      setBalance(balance + newTransaction.amount);
      setMonthlyIncome(monthlyIncome + newTransaction.amount);
    } else {
      setBalance(balance - newTransaction.amount);
      setMonthlyExpenses(monthlyExpenses + newTransaction.amount);
    }
  };

  return (
    <Layout onAddTransaction={handleAddTransaction}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Personalized Greeting */}
        <div className="mb-6">
          <h2 className="text-2xl">
            {getGreeting()}{userName ? `, ${userName}` : ''}! 🐼
          </h2>
          <p className="text-muted-foreground">Here's your financial overview</p>
        </div>

        {/* Balance Card */}
        <div className="bg-primary text-white rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex items-center gap-2 mb-2 opacity-90">
            <Wallet className="size-5" />
            <span className="text-sm">Total Balance</span>
          </div>
          <div className="text-4xl mb-4">${balance.toFixed(2)}</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="size-4" />
                <span className="text-xs opacity-90">Income</span>
              </div>
              <div className="text-xl">${monthlyIncome}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="size-4" />
                <span className="text-xs opacity-90">Expenses</span>
              </div>
              <div className="text-xl">${monthlyExpenses}</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid with Bamboo on Right */}
        <div className="flex gap-6">
          {/* Left Side Content */}
          <div className="flex-1 space-y-6">
            {/* Time Period Filter */}
            <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">View:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTimePeriod('week')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      timePeriod === 'week'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    <Calendar className="size-4" />
                    Week
                  </button>
                  <button
                    onClick={() => setTimePeriod('month')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      timePeriod === 'month'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    <CalendarDays className="size-4" />
                    Month
                  </button>
                  <button
                    onClick={() => setTimePeriod('year')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      timePeriod === 'year'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    <CalendarRange className="size-4" />
                    Year
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Spending by Category */}
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <h3 className="mb-4 flex items-center gap-2">
                  <Target className="size-5 text-primary" />
                  Spending by Category
                </h3>
                <div suppressHydrationWarning>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart key={`spending-pie-${timePeriod}`}>
                      <Pie
                        data={expensesByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: $${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expensesByCategory.map((entry, index) => (
                          <Cell key={`home-spending-cell-${entry.name}-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {expensesByCategory.map((category, index) => (
                    <div key={`legend-${category.name}-${index}`} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                      <span className="text-sm text-muted-foreground">{category.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Overview */}
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <h3 className="mb-4 flex items-center gap-2">
                  <TrendingUp className="size-5 text-primary" />
                  Monthly Overview
                </h3>
                <div suppressHydrationWarning>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={timeSeriesData} key={`overview-bar-${timePeriod}`}>
                      <XAxis dataKey="period" stroke="#52796f" />
                      <YAxis stroke="#52796f" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #95d5b2',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="income" fill="#2d6a4f" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="expenses" fill="#95d5b2" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {/* Custom Legend */}
                <div className="flex items-center justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: '#2d6a4f' }} />
                    <span className="text-sm text-muted-foreground">Income</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: '#95d5b2' }} />
                    <span className="text-sm text-muted-foreground">Expenses</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3>Recent Transactions</h3>
                <Link to="/transactions" className="text-primary hover:underline text-sm">
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {transactions.slice(0, 6).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-secondary transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'income' ? 'bg-primary/10 text-primary' : 'bg-accent'
                      }`}>
                        {getCategoryIcon(transaction.category)}
                      </div>
                      <div>
                        <div>{transaction.name}</div>
                        <div className="text-sm text-muted-foreground">{transaction.category} • {transaction.date}</div>
                      </div>
                    </div>
                    <div className={`${transaction.type === 'income' ? 'text-primary' : 'text-foreground'}`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bamboo Progress Bar - Right Side Vertical */}
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border flex flex-col items-center" style={{ minHeight: 'calc(100vh - 450px)' }}>
            {/* Goal at top */}
            <div className="mb-4 text-center">
              <div className="w-20 h-20 bg-accent rounded-2xl flex items-center justify-center shadow-md mb-2">
                <span className="text-3xl">💻</span>
              </div>
              <div className="text-xs text-muted-foreground">Goal!</div>
              <div className="text-sm font-medium mt-1">${savingsGoal}</div>
            </div>

            {/* Bamboo stalk - takes full height */}
            <div className="relative flex-1 w-16 min-h-[400px] rounded-full overflow-hidden bg-[#E8D7B8] shadow-inner border-2 border-[#D4C5A9]">
              {/* Bamboo segments - horizontal rings */}
              <div className="absolute top-[15%] w-full h-2 bg-[#8B7355] opacity-40"></div>
              <div className="absolute top-[30%] w-full h-2 bg-[#8B7355] opacity-40"></div>
              <div className="absolute top-[45%] w-full h-2 bg-[#8B7355] opacity-40"></div>
              <div className="absolute top-[60%] w-full h-2 bg-[#8B7355] opacity-40"></div>
              <div className="absolute top-[75%] w-full h-2 bg-[#8B7355] opacity-40"></div>
              <div className="absolute top-[90%] w-full h-2 bg-[#8B7355] opacity-40"></div>

              {/* Progress fill - green bamboo color */}
              <div 
                className="absolute bottom-0 w-full bg-primary transition-all duration-700 ease-out"
                style={{ height: `${savingsProgress}%` }}
              ></div>

              {/* Climbing Panda */}
              <div 
                className="absolute left-1/2 -translate-x-1/2 transition-all duration-700 ease-out"
                style={{ bottom: `${Math.max(savingsProgress - 5, 0)}%` }}
              >
                <div className="relative" style={{ width: '80px', height: '80px' }}>
                  {/* Panda climbing SVG - more realistic */}
                  <svg viewBox="0 0 100 100" className="w-full h-full animate-bounce-subtle">
                    {/* Left arm (hugging bamboo) */}
                    <ellipse cx="20" cy="45" rx="12" ry="16" fill="#2d2d2d" transform="rotate(-20 20 45)" />
                    
                    {/* Right arm (hugging bamboo) */}
                    <ellipse cx="80" cy="45" rx="12" ry="16" fill="#2d2d2d" transform="rotate(20 80 45)" />
                    
                    {/* Left leg */}
                    <ellipse cx="30" cy="75" rx="13" ry="18" fill="#2d2d2d" transform="rotate(-15 30 75)" />
                    
                    {/* Right leg */}
                    <ellipse cx="70" cy="75" rx="13" ry="18" fill="#2d2d2d" transform="rotate(15 70 75)" />
                    
                    {/* Body */}
                    <ellipse cx="50" cy="55" rx="28" ry="32" fill="#f0f0f0" />
                    
                    {/* Head */}
                    <circle cx="50" cy="30" r="22" fill="#f0f0f0" />
                    
                    {/* Left ear */}
                    <circle cx="35" cy="18" r="9" fill="#2d2d2d" />
                    
                    {/* Right ear */}
                    <circle cx="65" cy="18" r="9" fill="#2d2d2d" />
                    
                    {/* Left eye patch */}
                    <ellipse cx="42" cy="28" rx="7" ry="9" fill="#2d2d2d" transform="rotate(-15 42 28)" />
                    
                    {/* Right eye patch */}
                    <ellipse cx="58" cy="28" rx="7" ry="9" fill="#2d2d2d" transform="rotate(15 58 28)" />
                    
                    {/* Left eye */}
                    <circle cx="42" cy="28" r="3" fill="#ffffff" />
                    
                    {/* Right eye */}
                    <circle cx="58" cy="28" r="3" fill="#ffffff" />
                    
                    {/* Nose */}
                    <ellipse cx="50" cy="36" rx="4" ry="3" fill="#2d2d2d" />
                    
                    {/* Mouth - happy */}
                    <path d="M 45 38 Q 50 42 55 38" stroke="#2d2d2d" strokeWidth="2" fill="none" strokeLinecap="round" />
                    
                    {/* Belly spot */}
                    <ellipse cx="50" cy="60" rx="12" ry="14" fill="#e8e8e8" opacity="0.4" />
                  </svg>
                  
                  {/* Add slight rocking animation for climbing effect */}
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

              {/* Progress percentage badge */}
              <div 
                className="absolute -left-12 transition-all duration-700 ease-out"
                style={{ top: `${100 - savingsProgress}%` }}
              >
                <div className="bg-white border border-primary rounded px-2 py-1 shadow-sm">
                  <div className="text-xs font-medium text-primary">{savingsProgress.toFixed(0)}%</div>
                </div>
              </div>
            </div>

            {/* Start marker */}
            <div className="mt-4 text-center">
              <div className="text-xs text-muted-foreground">Start</div>
              <div className="text-sm">$0</div>
              <div className="mt-3 bg-accent/30 px-3 py-2 rounded-lg max-w-[140px]">
                <p className="text-xs">
                  ${savingsGoal - currentSavings} to go! 🎯
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}