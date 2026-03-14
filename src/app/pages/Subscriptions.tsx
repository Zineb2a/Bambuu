import { useState, useEffect } from "react";
import { Plus, Edit2, X, Calendar, DollarSign, AlertCircle } from "lucide-react";
import Layout from "../components/Layout";

interface Subscription {
  id: string;
  emoji: string;
  name: string;
  category: string;
  monthlyCost: number;
  renewalDate: string;
  hasStudentDiscount: boolean;
}

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    const saved = localStorage.getItem("subscriptions");
    return saved ? JSON.parse(saved) : [
      {
        id: "1",
        emoji: "🎬",
        name: "Netflix",
        category: "Entertainment",
        monthlyCost: 15.99,
        renewalDate: "2026-03-19",
        hasStudentDiscount: true
      },
      {
        id: "2",
        emoji: "🎵",
        name: "Spotify Premium",
        category: "Music",
        monthlyCost: 9.99,
        renewalDate: "2026-03-14",
        hasStudentDiscount: true
      },
      {
        id: "3",
        emoji: "🤖",
        name: "ChatGPT Plus",
        category: "AI Tools",
        monthlyCost: 20.00,
        renewalDate: "2026-03-24",
        hasStudentDiscount: false
      },
      {
        id: "4",
        emoji: "💻",
        name: "GitHub Pro",
        category: "Development",
        monthlyCost: 4.00,
        renewalDate: "2026-03-17",
        hasStudentDiscount: true
      },
      {
        id: "5",
        emoji: "📝",
        name: "Notion",
        category: "Productivity",
        monthlyCost: 8.00,
        renewalDate: "2026-03-21",
        hasStudentDiscount: true
      },
      {
        id: "6",
        emoji: "🎨",
        name: "Adobe Creative Cloud",
        category: "Design",
        monthlyCost: 19.99,
        renewalDate: "2026-03-27",
        hasStudentDiscount: true
      },
      {
        id: "7",
        emoji: "🖼️",
        name: "Midjourney",
        category: "AI Tools",
        monthlyCost: 10.00,
        renewalDate: "2026-03-11",
        hasStudentDiscount: false
      }
    ];
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [newSubscription, setNewSubscription] = useState<Subscription>({
    id: "",
    emoji: "📱",
    name: "",
    category: "",
    monthlyCost: 0,
    renewalDate: "",
    hasStudentDiscount: false
  });

  useEffect(() => {
    localStorage.setItem("subscriptions", JSON.stringify(subscriptions));
  }, [subscriptions]);

  const totalMonthlyCost = subscriptions.reduce((total, sub) => total + sub.monthlyCost, 0);

  const handleAddSubscription = () => {
    const subscription: Subscription = {
      ...newSubscription,
      id: Date.now().toString()
    };
    setSubscriptions([...subscriptions, subscription]);
    setShowAddModal(false);
    setNewSubscription({
      id: "",
      emoji: "📱",
      name: "",
      category: "",
      monthlyCost: 0,
      renewalDate: "",
      hasStudentDiscount: false
    });
  };

  const handleEditSubscription = () => {
    if (editingSubscription) {
      setSubscriptions(subscriptions.map(sub => 
        sub.id === editingSubscription.id ? editingSubscription : sub
      ));
      setShowEditModal(false);
      setEditingSubscription(null);
    }
  };

  const handleCancelSubscription = (id: string) => {
    if (confirm("Are you sure you want to cancel this subscription?")) {
      setSubscriptions(subscriptions.filter(sub => sub.id !== id));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  const categories = [
    "Entertainment",
    "Music",
    "AI Tools",
    "Development",
    "Productivity",
    "Design",
    "Education",
    "Health & Fitness",
    "News & Magazines",
    "Gaming",
    "Other"
  ];

  const emojis = ["🎬", "🎵", "🤖", "💻", "📝", "🎨", "🖼️", "📱", "🎮", "📚", "🏋️", "📰", "🎓", "☁️", "🔒", "📊"];

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2>Subscriptions</h2>
            <p className="text-muted-foreground mt-1">Track and manage your subscriptions</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Plus className="size-5" />
            Add Subscription
          </button>
        </div>

        {/* Total Monthly Cost */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Total Monthly Cost</p>
              <h1 className="text-4xl font-bold text-primary">${totalMonthlyCost.toFixed(2)}</h1>
              <p className="text-sm text-muted-foreground mt-2">
                {subscriptions.length} active subscription{subscriptions.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="text-6xl">🐼💳</div>
          </div>
        </div>

        {/* Subscriptions List */}
        <div className="space-y-4">
          {subscriptions.map((subscription) => (
            <div key={subscription.id} className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-start gap-4">
                {/* Emoji */}
                <div className="text-5xl">{subscription.emoji}</div>

                {/* Subscription Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{subscription.name}</h3>
                      <p className="text-sm text-muted-foreground">{subscription.category}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingSubscription(subscription);
                          setShowEditModal(true);
                        }}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                      >
                        <Edit2 className="size-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleCancelSubscription(subscription.id)}
                        className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                      >
                        <X className="size-4" />
                        Cancel
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="size-4 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="font-medium">Monthly Cost</span>
                        <span className="ml-2 text-primary font-semibold">${subscription.monthlyCost.toFixed(2)}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="font-medium">Renews</span>
                        <span className="ml-2">{formatDate(subscription.renewalDate)}</span>
                      </span>
                    </div>
                  </div>

                  {/* Student Discount Alert */}
                  {subscription.hasStudentDiscount && (
                    <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-start gap-2">
                      <AlertCircle className="size-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-amber-700 dark:text-amber-300">Student Discount Available!</p>
                        <p className="text-amber-600 dark:text-amber-400 mt-1">
                          {subscription.name} offers a student discount. You could be saving money!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Subscription Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Add Subscription</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Emoji Picker */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Icon</label>
                  <div className="grid grid-cols-8 gap-2">
                    {emojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setNewSubscription({ ...newSubscription, emoji })}
                        className={`text-2xl p-2 rounded-lg transition-all ${
                          newSubscription.emoji === emoji
                            ? 'bg-primary/20 ring-2 ring-primary'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Subscription Name</label>
                  <input
                    type="text"
                    value={newSubscription.name}
                    onChange={(e) => setNewSubscription({ ...newSubscription, name: e.target.value })}
                    placeholder="e.g., Netflix"
                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <select
                    value={newSubscription.category}
                    onChange={(e) => setNewSubscription({ ...newSubscription, category: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Monthly Cost */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Monthly Cost</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={newSubscription.monthlyCost || ''}
                      onChange={(e) => setNewSubscription({ ...newSubscription, monthlyCost: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                {/* Renewal Date */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Next Renewal Date</label>
                  <input
                    type="date"
                    value={newSubscription.renewalDate}
                    onChange={(e) => setNewSubscription({ ...newSubscription, renewalDate: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Student Discount */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Has Student Discount?</label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Enable if this service offers student pricing
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newSubscription.hasStudentDiscount}
                      onChange={(e) => setNewSubscription({ ...newSubscription, hasStudentDiscount: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-muted rounded-full peer peer-checked:bg-primary peer-focus:ring-4 peer-focus:ring-primary/20 transition-colors relative">
                      <div className={`absolute top-0.5 left-0.5 bg-white rounded-full h-6 w-6 transition-transform ${newSubscription.hasStudentDiscount ? 'translate-x-7' : ''}`}></div>
                    </div>
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-muted text-foreground px-4 py-3 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddSubscription}
                    className="flex-1 bg-primary text-primary-foreground px-4 py-3 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Add Subscription
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Subscription Modal */}
        {showEditModal && editingSubscription && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Edit Subscription</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingSubscription(null);
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Emoji Picker */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Icon</label>
                  <div className="grid grid-cols-8 gap-2">
                    {emojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setEditingSubscription({ ...editingSubscription, emoji })}
                        className={`text-2xl p-2 rounded-lg transition-all ${
                          editingSubscription.emoji === emoji
                            ? 'bg-primary/20 ring-2 ring-primary'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Subscription Name</label>
                  <input
                    type="text"
                    value={editingSubscription.name}
                    onChange={(e) => setEditingSubscription({ ...editingSubscription, name: e.target.value })}
                    placeholder="e.g., Netflix"
                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <select
                    value={editingSubscription.category}
                    onChange={(e) => setEditingSubscription({ ...editingSubscription, category: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Monthly Cost */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Monthly Cost</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={editingSubscription.monthlyCost || ''}
                      onChange={(e) => setEditingSubscription({ ...editingSubscription, monthlyCost: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                {/* Renewal Date */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Next Renewal Date</label>
                  <input
                    type="date"
                    value={editingSubscription.renewalDate}
                    onChange={(e) => setEditingSubscription({ ...editingSubscription, renewalDate: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Student Discount */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Has Student Discount?</label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Enable if this service offers student pricing
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingSubscription.hasStudentDiscount}
                      onChange={(e) => setEditingSubscription({ ...editingSubscription, hasStudentDiscount: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-muted rounded-full peer peer-checked:bg-primary peer-focus:ring-4 peer-focus:ring-primary/20 transition-colors relative">
                      <div className={`absolute top-0.5 left-0.5 bg-white rounded-full h-6 w-6 transition-transform ${editingSubscription.hasStudentDiscount ? 'translate-x-7' : ''}`}></div>
                    </div>
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingSubscription(null);
                    }}
                    className="flex-1 bg-muted text-foreground px-4 py-3 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditSubscription}
                    className="flex-1 bg-primary text-primary-foreground px-4 py-3 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
