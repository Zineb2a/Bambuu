import { useState } from "react";
import { Link } from "react-router";
import { 
  ArrowLeft, 
  Target, 
  Plus, 
  Edit2, 
  Trash2, 
  Check,
  X,
  DollarSign,
  Tag,
  Utensils,
  Book,
  Bus,
  Film,
  ShoppingCart,
  Wallet,
  Coffee,
  Home as HomeIcon,
  Music,
  Smartphone,
  Heart,
  Globe
} from "lucide-react";
import Layout from "../components/Layout";

interface Category {
  id: string;
  name: string;
  budget: number;
  spent: number;
  icon: string;
  color: string;
}

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  emoji: string;
}

export default function BudgetSettings() {
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Food', budget: 200, spent: 125.50, icon: 'utensils', color: '#2d6a4f' },
    { id: '2', name: 'Books', budget: 150, spent: 150, icon: 'book', color: '#52b788' },
    { id: '3', name: 'Transport', budget: 80, spent: 50, icon: 'bus', color: '#74c69d' },
    { id: '4', name: 'Entertainment', budget: 150, spent: 224, icon: 'film', color: '#95d5b2' },
    { id: '5', name: 'Other', budget: 100, spent: 30, icon: 'shopping', color: '#b7e4c7' },
  ]);

  const [savingsGoal, setSavingsGoal] = useState<SavingsGoal>({
    id: '1',
    name: 'New Laptop',
    targetAmount: 1200,
    currentAmount: 450,
    emoji: '💻'
  });

  const [editingGoal, setEditingGoal] = useState(false);
  const [goalName, setGoalName] = useState(savingsGoal.name);
  const [goalAmount, setGoalAmount] = useState(String(savingsGoal.targetAmount));
  const [goalEmoji, setGoalEmoji] = useState(savingsGoal.emoji);

  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editBudget, setEditBudget] = useState('');

  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryBudget, setNewCategoryBudget] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('shopping');
  const [newCategoryColor, setNewCategoryColor] = useState('#95d5b2');

  // Currency settings
  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  const [editingCurrency, setEditingCurrency] = useState(false);
  const [exchangeRates] = useState({
    'USD': 1,
    'EUR': 0.92,
    'GBP': 0.79,
    'CAD': 1.35,
    'AUD': 1.52,
    'JPY': 149.50,
    'CNY': 7.24,
  });

  const currencySymbols: { [key: string]: string } = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'CAD': 'C$',
    'AUD': 'A$',
    'JPY': '¥',
    'CNY': '¥',
  };

  const iconOptions = [
    { value: 'utensils', label: 'Food', icon: Utensils },
    { value: 'book', label: 'Books', icon: Book },
    { value: 'bus', label: 'Transport', icon: Bus },
    { value: 'film', label: 'Entertainment', icon: Film },
    { value: 'shopping', label: 'Shopping', icon: ShoppingCart },
    { value: 'coffee', label: 'Coffee', icon: Coffee },
    { value: 'home', label: 'Home', icon: HomeIcon },
    { value: 'music', label: 'Music', icon: Music },
    { value: 'smartphone', label: 'Smartphone', icon: Smartphone },
    { value: 'heart', label: 'Heart', icon: Heart },
  ];

  const colorOptions = [
    '#2d6a4f', '#52b788', '#74c69d', '#95d5b2', '#b7e4c7', 
    '#40916c', '#1b4332', '#081c15', '#52796f', '#84a98c'
  ];

  const emojiOptions = ['💻', '📱', '🎮', '🚗', '✈️', '🏠', '🎓', '💍', '🎸', '📷', '🚲', '⌚'];

  const getIcon = (iconName: string) => {
    const option = iconOptions.find(opt => opt.value === iconName);
    return option ? option.icon : ShoppingCart;
  };

  const handleSaveGoal = () => {
    setSavingsGoal({
      ...savingsGoal,
      name: goalName,
      targetAmount: parseFloat(goalAmount),
      emoji: goalEmoji
    });
    setEditingGoal(false);
  };

  const handleSaveBudget = (categoryId: string) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId 
        ? { ...cat, budget: parseFloat(editBudget) }
        : cat
    ));
    setEditingCategory(null);
    setEditBudget('');
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      setCategories(categories.filter(cat => cat.id !== categoryId));
    }
  };

  const handleAddCategory = () => {
    if (!newCategoryName || !newCategoryBudget) {
      alert('Please fill in all fields');
      return;
    }

    const newCategory: Category = {
      id: String(Date.now()),
      name: newCategoryName,
      budget: parseFloat(newCategoryBudget),
      spent: 0,
      icon: newCategoryIcon,
      color: newCategoryColor
    };

    setCategories([...categories, newCategory]);
    setAddingCategory(false);
    setNewCategoryName('');
    setNewCategoryBudget('');
    setNewCategoryIcon('shopping');
    setNewCategoryColor('#95d5b2');
  };

  const totalBudget = categories.reduce((sum, cat) => sum + cat.budget, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Main Savings Goal */}
        <div className="bg-gradient-to-br from-primary to-[#52b788] text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="size-6" />
              <h2 className="text-white">Main Savings Goal</h2>
            </div>
            {!editingGoal && (
              <button 
                onClick={() => {
                  setEditingGoal(true);
                  setGoalName(savingsGoal.name);
                  setGoalAmount(String(savingsGoal.targetAmount));
                  setGoalEmoji(savingsGoal.emoji);
                }}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
              >
                <Edit2 className="size-4" />
              </button>
            )}
          </div>

          {editingGoal ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/80 mb-2 block">Goal Name</label>
                <input
                  type="text"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="w-full px-4 py-2 bg-white/20 text-white placeholder:text-white/60 rounded-lg outline-none focus:bg-white/30 transition-colors"
                  placeholder="e.g., New Laptop"
                />
              </div>

              <div>
                <label className="text-sm text-white/80 mb-2 block">Target Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                  className="w-full px-4 py-2 bg-white/20 text-white placeholder:text-white/60 rounded-lg outline-none focus:bg-white/30 transition-colors"
                  placeholder="1200"
                />
              </div>

              <div>
                <label className="text-sm text-white/80 mb-2 block">Emoji Icon</label>
                <div className="grid grid-cols-6 gap-2">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setGoalEmoji(emoji)}
                      className={`text-2xl p-3 rounded-lg transition-all ${
                        goalEmoji === emoji 
                          ? 'bg-white/30 scale-110' 
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSaveGoal}
                  className="flex-1 bg-white text-primary py-2 rounded-lg hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="size-4" />
                  Save Goal
                </button>
                <button
                  onClick={() => {
                    setEditingGoal(false);
                    setGoalName(savingsGoal.name);
                    setGoalAmount(String(savingsGoal.targetAmount));
                    setGoalEmoji(savingsGoal.emoji);
                  }}
                  className="px-4 bg-white/20 hover:bg-white/30 py-2 rounded-lg transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
                  {savingsGoal.emoji}
                </div>
                <div>
                  <div className="text-2xl mb-1">{savingsGoal.name}</div>
                  <div className="text-white/80">
                    ${savingsGoal.currentAmount} / ${savingsGoal.targetAmount}
                  </div>
                </div>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${(savingsGoal.currentAmount / savingsGoal.targetAmount * 100)}%` }}
                />
              </div>
              <div className="text-sm text-white/80 mt-2">
                {((savingsGoal.currentAmount / savingsGoal.targetAmount) * 100).toFixed(1)}% complete • ${savingsGoal.targetAmount - savingsGoal.currentAmount} to go
              </div>
            </div>
          )}
        </div>

        {/* Budget Overview */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="mb-4">Monthly Budget Overview</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-secondary rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">Total Budget</div>
              <div className="text-2xl text-primary">${totalBudget}</div>
            </div>
            <div className="bg-secondary rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">Total Spent</div>
              <div className="text-2xl">${totalSpent.toFixed(2)}</div>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                totalSpent > totalBudget ? 'bg-destructive' : 'bg-primary'
              }`}
              style={{ width: `${Math.min((totalSpent / totalBudget * 100), 100)}%` }}
            />
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            {totalSpent > totalBudget ? (
              <span className="text-destructive">⚠️ Over budget by ${(totalSpent - totalBudget).toFixed(2)}</span>
            ) : (
              <span className="text-primary">✓ ${(totalBudget - totalSpent).toFixed(2)} remaining</span>
            )}
          </div>
        </div>

        {/* Currency Settings */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Globe className="size-5 text-primary" />
              <h3>Currency Settings</h3>
            </div>
            {!editingCurrency && (
              <button
                onClick={() => setEditingCurrency(true)}
                className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-accent transition-colors"
              >
                <Edit2 className="size-4" />
                Change
              </button>
            )}
          </div>

          {editingCurrency ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Select Default Currency</label>
                <select
                  value={defaultCurrency}
                  onChange={(e) => setDefaultCurrency(e.target.value)}
                  className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {Object.keys(exchangeRates).map((currency) => (
                    <option key={currency} value={currency}>
                      {currency} ({currencySymbols[currency]})
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-secondary rounded-lg p-4">
                <h4 className="text-sm mb-3">Exchange Rates (vs USD)</h4>
                <div className="space-y-2">
                  {Object.entries(exchangeRates).filter(([curr]) => curr !== 'USD').map(([currency, rate]) => (
                    <div key={currency} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">1 USD = {rate} {currency}</span>
                      <span>{currencySymbols[currency]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setEditingCurrency(false)}
                  className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Check className="size-4" />
                  Save Currency
                </button>
                <button
                  onClick={() => setEditingCurrency(false)}
                  className="px-4 bg-muted hover:bg-accent py-2 rounded-lg transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="bg-gradient-to-br from-primary/10 to-[#52b788]/10 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Default Currency</div>
                    <div className="text-2xl">{defaultCurrency}</div>
                  </div>
                  <div className="text-4xl">{currencySymbols[defaultCurrency]}</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                All transactions will be displayed in {defaultCurrency}. You can enter amounts in other currencies and they'll be automatically converted.
              </p>
            </div>
          )}
        </div>

        {/* Category Budgets */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3>Category Budgets</h3>
            <button
              onClick={() => setAddingCategory(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="size-4" />
              Add Category
            </button>
          </div>

          <div className="space-y-3">
            {categories.map((category) => {
              const percentage = (category.spent / category.budget) * 100;
              const isOverBudget = category.spent > category.budget;
              const IconComponent = getIcon(category.icon);

              return (
                <div key={category.id} className="bg-secondary rounded-lg p-4">
                  {editingCategory === category.id ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: category.color }}
                        >
                          <IconComponent className="size-5" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{category.name}</div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Monthly Budget ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editBudget}
                          onChange={(e) => setEditBudget(e.target.value)}
                          className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          autoFocus
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveBudget(category.id)}
                          className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                        >
                          <Check className="size-4" />
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingCategory(null);
                            setEditBudget('');
                          }}
                          className="px-4 bg-muted hover:bg-accent py-2 rounded-lg transition-colors"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                            style={{ backgroundColor: category.color }}
                          >
                            <IconComponent className="size-5" />
                          </div>
                          <div>
                            <div className="font-medium">{category.name}</div>
                            <div className="text-sm text-muted-foreground">
                              ${category.spent.toFixed(2)} / ${category.budget}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingCategory(category.id);
                              setEditBudget(String(category.budget));
                            }}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                          >
                            <Edit2 className="size-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>

                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            isOverBudget ? 'bg-destructive' : 'bg-primary'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      <div className="text-sm text-muted-foreground mt-2 flex items-center justify-between">
                        <span>{percentage.toFixed(1)}% used</span>
                        {isOverBudget ? (
                          <span className="text-destructive">
                            ⚠️ ${(category.spent - category.budget).toFixed(2)} over
                          </span>
                        ) : (
                          <span className="text-primary">
                            ${(category.budget - category.spent).toFixed(2)} left
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Add Category Modal */}
        {addingCategory && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-primary text-primary-foreground px-6 py-4 rounded-t-2xl flex items-center justify-between">
                <h2 className="text-white">Add New Category</h2>
                <button onClick={() => setAddingCategory(false)} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
                  <X className="size-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block flex items-center gap-1">
                    <Tag className="size-4" />
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g., Gym"
                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block flex items-center gap-1">
                    <DollarSign className="size-4" />
                    Monthly Budget
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newCategoryBudget}
                    onChange={(e) => setNewCategoryBudget(e.target.value)}
                    placeholder="100"
                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Icon</label>
                  <div className="grid grid-cols-4 gap-2">
                    {iconOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setNewCategoryIcon(option.value)}
                          className={`p-3 rounded-lg transition-all flex flex-col items-center gap-1 ${
                            newCategoryIcon === option.value 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-secondary hover:bg-accent'
                          }`}
                        >
                          <Icon className="size-5" />
                          <span className="text-xs">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Color</label>
                  <div className="grid grid-cols-5 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewCategoryColor(color)}
                        className={`w-full aspect-square rounded-lg transition-all ${
                          newCategoryColor === color 
                            ? 'ring-4 ring-primary ring-offset-2' 
                            : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleAddCategory}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Plus className="size-4" />
                  Add Category
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-gradient-to-r from-[#e8f5e8] to-[#d8f3dc] border border-primary/20 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="text-3xl">🐼</div>
            <div>
              <h4 className="mb-2 text-primary">Budget Tips</h4>
              <ul className="space-y-2 text-sm text-foreground/80">
                <li>• Set realistic budgets based on your past spending habits</li>
                <li>• Review and adjust your budgets monthly to stay on track</li>
                <li>• Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings</li>
                <li>• Track your progress regularly to build better habits 🎯</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}