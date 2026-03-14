import { useState } from "react";
import { 
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
  Coffee,
  Home as HomeIcon,
  Music,
  Smartphone,
  Heart,
  Pin,
  PinOff
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
  pinned?: boolean;
}

export default function BudgetGoals() {
  // Goals state
  const [goals, setGoals] = useState<SavingsGoal[]>([
    { id: '1', name: 'New Laptop', targetAmount: 1200, currentAmount: 450, emoji: '💻', pinned: true },
    { id: '2', name: 'Summer Trip', targetAmount: 800, currentAmount: 200, emoji: '✈️' },
    { id: '3', name: 'Emergency Fund', targetAmount: 1000, currentAmount: 750, emoji: '🎯' },
    { id: '4', name: 'Course Certification', targetAmount: 300, currentAmount: 150, emoji: '🎓' },
  ]);

  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [goalName, setGoalName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [goalCurrent, setGoalCurrent] = useState('');
  const [goalEmoji, setGoalEmoji] = useState('💻');
  const [addingGoal, setAddingGoal] = useState(false);

  // Budget categories state
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Food', budget: 200, spent: 125.50, icon: 'utensils', color: '#A0C878' },
    { id: '2', name: 'Books', budget: 150, spent: 150, icon: 'book', color: '#DDEB9D' },
    { id: '3', name: 'Transport', budget: 80, spent: 50, icon: 'bus', color: '#8ab060' },
    { id: '4', name: 'Entertainment', budget: 150, spent: 224, icon: 'film', color: '#c5e096' },
    { id: '5', name: 'Other', budget: 100, spent: 30, icon: 'shopping', color: '#d9f0b3' },
  ]);

  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editBudget, setEditBudget] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryBudget, setNewCategoryBudget] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('shopping');
  const [newCategoryColor, setNewCategoryColor] = useState('#DDEB9D');

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

  const emojiOptions = ['💻', '📱', '🎮', '🚗', '✈️', '🏠', '🎓', '💍', '🎸', '📷', '🚲', '⌚', '🎯', '💰'];

  const getIcon = (iconName: string) => {
    const option = iconOptions.find(opt => opt.value === iconName);
    return option ? option.icon : ShoppingCart;
  };

  // Goal handlers
  const handleSaveGoal = () => {
    if (editingGoal) {
      setGoals(goals.map(g => 
        g.id === editingGoal 
          ? { ...g, name: goalName, targetAmount: parseFloat(goalAmount), emoji: goalEmoji }
          : g
      ));
      setEditingGoal(null);
    } else if (addingGoal) {
      const newGoal: SavingsGoal = {
        id: String(Date.now()),
        name: goalName,
        targetAmount: parseFloat(goalAmount),
        currentAmount: parseFloat(goalCurrent) || 0,
        emoji: goalEmoji
      };
      setGoals([...goals, newGoal]);
      setAddingGoal(false);
    }
    setGoalName('');
    setGoalAmount('');
    setGoalCurrent('');
    setGoalEmoji('💻');
  };

  const handleDeleteGoal = (goalId: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      setGoals(goals.filter(g => g.id !== goalId));
    }
  };

  const handlePinGoal = (goalId: string) => {
    // Unpin all goals first, then pin the selected one
    setGoals(goals.map(g => ({
      ...g,
      pinned: g.id === goalId ? !g.pinned : false
    })));
    // Save to localStorage so Home page can access it
    const pinnedGoal = goals.find(g => g.id === goalId);
    if (pinnedGoal && !pinnedGoal.pinned) {
      localStorage.setItem('pinnedGoal', JSON.stringify({ ...pinnedGoal, pinned: true }));
    } else {
      localStorage.removeItem('pinnedGoal');
    }
  };

  // Budget handlers
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
  const totalGoalsTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalGoalsSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Overview Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-primary text-white rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Target className="size-5" />
              <h3 className="text-white">Savings Goals</h3>
            </div>
            <div className="text-3xl mb-1">${totalGoalsSaved}</div>
            <div className="text-white/80 text-sm">of ${totalGoalsTarget} total</div>
            <div className="mt-3 w-full bg-white/20 rounded-full h-2">
              <div 
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${(totalGoalsSaved / totalGoalsTarget * 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="size-5 text-primary" />
              <h3>Monthly Budget</h3>
            </div>
            <div className="text-3xl mb-1">${totalSpent.toFixed(2)}</div>
            <div className="text-muted-foreground text-sm">of ${totalBudget} budget</div>
            <div className="mt-3 w-full bg-muted rounded-full h-2">
              <div 
                className={`h-full rounded-full transition-all ${
                  totalSpent > totalBudget ? 'bg-destructive' : 'bg-primary'
                }`}
                style={{ width: `${Math.min((totalSpent / totalBudget * 100), 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Savings Goals Section */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3>Your Savings Goals</h3>
            <button
              onClick={() => {
                setAddingGoal(true);
                setGoalName('');
                setGoalAmount('');
                setGoalCurrent('');
                setGoalEmoji('💻');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="size-4" />
              Add Goal
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {goals.map((goal) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              
              return (
                <div key={goal.id} className="bg-secondary rounded-lg p-4">
                  {editingGoal === goal.id ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-2xl">
                          {goalEmoji}
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={goalName}
                            onChange={(e) => setGoalName(e.target.value)}
                            className="w-full px-3 py-1 bg-input-background rounded border border-border focus:border-primary focus:outline-none"
                            placeholder="Goal name"
                          />
                        </div>
                      </div>

                      <input
                        type="number"
                        step="0.01"
                        value={goalAmount}
                        onChange={(e) => setGoalAmount(e.target.value)}
                        className="w-full px-3 py-2 bg-input-background rounded border border-border focus:border-primary focus:outline-none"
                        placeholder="Target amount"
                      />

                      <div className="grid grid-cols-6 gap-2">
                        {emojiOptions.slice(0, 6).map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => setGoalEmoji(emoji)}
                            className={`text-xl p-2 rounded transition-all ${
                              goalEmoji === emoji ? 'bg-primary/20 scale-110' : 'bg-muted hover:bg-accent'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveGoal}
                          className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:opacity-90 flex items-center justify-center gap-1"
                        >
                          <Check className="size-4" />
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingGoal(null);
                            setGoalName('');
                            setGoalAmount('');
                          }}
                          className="px-4 bg-muted hover:bg-accent py-2 rounded-lg"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-2xl">
                            {goal.emoji}
                          </div>
                          <div>
                            <div className="font-medium">{goal.name}</div>
                            <div className="text-sm text-muted-foreground">
                              ${goal.currentAmount} / ${goal.targetAmount}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingGoal(goal.id);
                              setGoalName(goal.name);
                              setGoalAmount(String(goal.targetAmount));
                              setGoalEmoji(goal.emoji);
                            }}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                          >
                            <Edit2 className="size-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                          >
                            <Trash2 className="size-4" />
                          </button>
                          <button
                            onClick={() => handlePinGoal(goal.id)}
                            className={`p-2 hover:bg-muted rounded-lg transition-colors ${
                              goal.pinned ? 'bg-primary' : ''
                            }`}
                          >
                            {goal.pinned ? <Pin className="size-4" /> : <PinOff className="size-4" />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{progress.toFixed(0)}% complete</span>
                        <span className="text-muted-foreground">${(goal.targetAmount - goal.currentAmount).toFixed(2)} to go</span>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
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

        {/* Add Goal Modal */}
        {addingGoal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full">
              <div className="sticky top-0 bg-primary text-primary-foreground px-6 py-4 rounded-t-2xl flex items-center justify-between">
                <h2 className="text-white">Add New Goal</h2>
                <button onClick={() => setAddingGoal(false)} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
                  <X className="size-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Goal Name</label>
                  <input
                    type="text"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    placeholder="e.g., New Laptop"
                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Target Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={goalAmount}
                    onChange={(e) => setGoalAmount(e.target.value)}
                    placeholder="1200"
                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Current Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={goalCurrent}
                    onChange={(e) => setGoalCurrent(e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Emoji Icon</label>
                  <div className="grid grid-cols-7 gap-2">
                    {emojiOptions.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setGoalEmoji(emoji)}
                        className={`text-2xl p-3 rounded-lg transition-all ${
                          goalEmoji === emoji 
                            ? 'bg-primary/20 scale-110' 
                            : 'bg-secondary hover:bg-accent'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSaveGoal}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Plus className="size-4" />
                  Add Goal
                </button>
              </div>
            </div>
          </div>
        )}

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
      </div>
    </Layout>
  );
}