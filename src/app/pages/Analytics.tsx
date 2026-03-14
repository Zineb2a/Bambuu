import { Link } from "react-router";
import { useState } from "react";
import { ArrowLeft, TrendingUp, TrendingDown, PieChart as PieChartIcon, BarChart3, Calendar, CalendarDays, CalendarRange } from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts";
import Layout from "../components/Layout";

export default function Analytics() {
  // Time period filter state
  const [timePeriod, setTimePeriod] = useState<'week' | 'month' | 'year'>('month');

  // Spending by category - WEEK
  const categoryDataWeek = [
    { name: 'Food', value: 35, color: '#2d6a4f', percentage: 34.3 },
    { name: 'Books', value: 0, color: '#52b788', percentage: 0 },
    { name: 'Transport', value: 12, color: '#74c69d', percentage: 11.8 },
    { name: 'Entertainment', value: 55, color: '#95d5b2', percentage: 53.9 },
  ];

  // Spending by category - MONTH
  const categoryDataMonth = [
    { name: 'Food', value: 125.50, color: '#2d6a4f', percentage: 22.8 },
    { name: 'Books', value: 150, color: '#52b788', percentage: 27.3 },
    { name: 'Transport', value: 50, color: '#74c69d', percentage: 9.1 },
    { name: 'Entertainment', value: 224, color: '#95d5b2', percentage: 40.8 },
  ];

  // Spending by category - YEAR
  const categoryDataYear = [
    { name: 'Food', value: 1580, color: '#2d6a4f', percentage: 29.3 },
    { name: 'Books', value: 850, color: '#52b788', percentage: 15.8 },
    { name: 'Transport', value: 620, color: '#74c69d', percentage: 11.5 },
    { name: 'Entertainment', value: 2340, color: '#95d5b2', percentage: 43.4 },
  ];

  // Get spending data based on time period
  const getCategoryData = () => {
    switch (timePeriod) {
      case 'week':
        return categoryDataWeek;
      case 'month':
        return categoryDataMonth;
      case 'year':
        return categoryDataYear;
      default:
        return categoryDataMonth;
    }
  };

  const categoryData = getCategoryData();

  // Monthly comparison (6 months)
  const monthlyComparison = [
    { month: 'Oct', income: 1650, expenses: 720, savings: 930 },
    { month: 'Nov', income: 1700, expenses: 680, savings: 1020 },
    { month: 'Dec', income: 1900, expenses: 850, savings: 1050 },
    { month: 'Jan', income: 1750, expenses: 625, savings: 1125 },
    { month: 'Feb', income: 1800, expenses: 580, savings: 1220 },
    { month: 'Mar', income: 1800, expenses: 549.50, savings: 1250.50 },
  ];

  // Daily spending trend (last 14 days)
  const dailySpending = [
    { day: 'Mar 1', amount: 0 },
    { day: 'Mar 2', amount: 0 },
    { day: 'Mar 3', amount: 150 },
    { day: 'Mar 4', amount: 0 },
    { day: 'Mar 5', amount: 85.50 },
    { day: 'Mar 6', amount: 0 },
    { day: 'Mar 7', amount: 50 },
    { day: 'Mar 8', amount: 24 },
    { day: 'Mar 9', amount: 0 },
    { day: 'Mar 10', amount: 40 },
    { day: 'Mar 11', amount: 0 },
    { day: 'Mar 12', amount: 200 },
    { day: 'Mar 13', amount: 0 },
    { day: 'Mar 14', amount: 0 },
  ];

  // Category trends over time
  const categoryTrends = [
    { month: 'Jan', food: 140, books: 120, transport: 55, entertainment: 310 },
    { month: 'Feb', food: 130, books: 90, transport: 50, entertainment: 310 },
    { month: 'Mar', food: 125.50, books: 150, transport: 50, entertainment: 224 },
  ];

  // Budget vs Actual
  const budgetComparison = [
    { category: 'Food', budget: 200, actual: 125.50 },
    { category: 'Books', budget: 150, actual: 150 },
    { category: 'Transport', budget: 80, actual: 50 },
    { category: 'Entertainment', budget: 150, actual: 224 },
  ];

  const totalIncome = 1800;
  const totalExpenses = 549.50;
  const savingsRate = ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1);
  const avgDailySpending = (549.50 / 14).toFixed(2);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Time Period Filter */}
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">View Analytics:</span>
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

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="text-sm text-muted-foreground mb-1">Savings Rate</div>
            <div className="text-2xl text-primary">{savingsRate}%</div>
            <div className="text-xs text-muted-foreground mt-1">of income</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="text-sm text-muted-foreground mb-1">Avg Daily</div>
            <div className="text-2xl">${avgDailySpending}</div>
            <div className="text-xs text-muted-foreground mt-1">spending</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="text-sm text-muted-foreground mb-1">Total Saved</div>
            <div className="text-2xl text-primary">${(totalIncome - totalExpenses).toFixed(2)}</div>
            <div className="text-xs text-muted-foreground mt-1">this month</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="text-sm text-muted-foreground mb-1">Top Category</div>
            <div className="text-2xl">📱</div>
            <div className="text-xs text-muted-foreground mt-1">Entertainment</div>
          </div>
        </div>

        {/* Insights Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-primary to-[#52b788] text-white rounded-xl p-6">
            <div className="flex items-start gap-3">
              <TrendingUp className="size-8 flex-shrink-0" />
              <div>
                <h4 className="mb-2">Great Job! 🎉</h4>
                <p className="text-sm text-white/90">
                  You're spending 15% less this month compared to last month. Your savings rate has improved to {savingsRate}%!
                </p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <TrendingDown className="size-8 flex-shrink-0 text-orange-500" />
              <div>
                <h4 className="mb-2 text-orange-900">Watch Out!</h4>
                <p className="text-sm text-orange-800">
                  Your Entertainment spending is 49% over budget. Consider setting limits to stay on track.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Recommendations */}
        <div className="bg-secondary border border-border rounded-xl p-6">
          <h3 className="mb-4">💡 Smart Recommendations</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">1</div>
              <div>
                <div className="font-medium mb-1">Reduce Entertainment Expenses</div>
                <p className="text-sm text-muted-foreground">Try cutting entertainment by $75 to stay within budget. This could save you $225 over 3 months!</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">2</div>
              <div>
                <div className="font-medium mb-1">Meal Prep to Save on Food</div>
                <p className="text-sm text-muted-foreground">Your food expenses are great! Keep up the good work with meal planning to maintain this trend.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">3</div>
              <div>
                <div className="font-medium mb-1">Increase Savings Goal</div>
                <p className="text-sm text-muted-foreground">Based on your current savings rate, you could increase your monthly savings target by $200.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Spending Distribution */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="size-5 text-primary" />
            <h3>Spending Distribution</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart key={`analytics-spending-pie-${timePeriod}`}>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`analytics-spending-cell-${entry.name}-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {categoryData.map((category, index) => (
                <div key={`analytics-legend-${category.name}-${index}`} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                      <span>{category.name}</span>
                    </div>
                    <span className="font-medium">${category.value}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="h-full rounded-full transition-all" 
                      style={{ 
                        backgroundColor: category.color,
                        width: `${category.percentage}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Income vs Expenses Trend */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="size-5 text-primary" />
            <h3>6-Month Trend</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyComparison}>
              <defs>
                <linearGradient id="analytics-colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2d6a4f" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2d6a4f" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="analytics-colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4183d" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#d4183d" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#52796f" />
              <YAxis stroke="#52796f" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #95d5b2',
                  borderRadius: '8px'
                }}
              />
              <Area type="monotone" dataKey="income" stroke="#2d6a4f" fillOpacity={1} fill="url(#analytics-colorIncome)" />
              <Area type="monotone" dataKey="expenses" stroke="#d4183d" fillOpacity={1} fill="url(#analytics-colorExpenses)" />
            </AreaChart>
          </ResponsiveContainer>
          {/* Custom Legend */}
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#2d6a4f' }} />
              <span className="text-sm text-muted-foreground">Income</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#d4183d' }} />
              <span className="text-sm text-muted-foreground">Expenses</span>
            </div>
          </div>
        </div>

        {/* Daily Spending Pattern */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="size-5 text-primary" />
            <h3>Daily Spending Pattern (Last 14 Days)</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailySpending}>
              <XAxis dataKey="day" stroke="#52796f" fontSize={12} />
              <YAxis stroke="#52796f" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #95d5b2',
                  borderRadius: '8px'
                }}
                formatter={(value) => `$${value}`}
              />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#2d6a4f" 
                strokeWidth={2}
                dot={{ fill: '#2d6a4f', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Budget vs Actual */}
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <h3 className="mb-4">Budget vs Actual</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetComparison}>
                <XAxis dataKey="category" stroke="#52796f" fontSize={12} />
                <YAxis stroke="#52796f" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #95d5b2',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="budget" fill="#95d5b2" radius={[8, 8, 0, 0]} />
                <Bar dataKey="actual" fill="#2d6a4f" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            {/* Custom Legend */}
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#95d5b2' }} />
                <span className="text-sm text-muted-foreground">Budget</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#2d6a4f' }} />
                <span className="text-sm text-muted-foreground">Actual</span>
              </div>
            </div>
          </div>

          {/* Category Trends */}
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <h3 className="mb-4">Category Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={categoryTrends}>
                <XAxis dataKey="month" stroke="#52796f" />
                <YAxis stroke="#52796f" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #95d5b2',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="food" stroke="#2d6a4f" strokeWidth={2} />
                <Line type="monotone" dataKey="books" stroke="#52b788" strokeWidth={2} />
                <Line type="monotone" dataKey="transport" stroke="#74c69d" strokeWidth={2} />
                <Line type="monotone" dataKey="entertainment" stroke="#95d5b2" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
            {/* Custom Legend */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#2d6a4f' }} />
                <span className="text-sm text-muted-foreground">Food</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#52b788' }} />
                <span className="text-sm text-muted-foreground">Books</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#74c69d' }} />
                <span className="text-sm text-muted-foreground">Transport</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#95d5b2' }} />
                <span className="text-sm text-muted-foreground">Entertainment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}