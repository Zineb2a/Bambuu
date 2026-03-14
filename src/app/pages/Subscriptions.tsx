import { useEffect, useState } from "react";
import { Plus, Edit2, X, Calendar, DollarSign, AlertCircle } from "lucide-react";
import Layout from "../components/Layout";
import { useUserCurrency } from "../hooks/useUserCurrency";
import { formatCurrency } from "../lib/currency";
import { BRAND_LOGO_SRC } from "../lib/branding";
import {
  createSubscription,
  getSubscriptionAmountInCurrency,
  listSubscriptions,
  removeSubscription,
  updateSubscription,
} from "../lib/finance";
import { useAuth } from "../providers/AuthProvider";
import { useI18n } from "../providers/I18nProvider";
import type { Subscription } from "../types/finance";

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
  "Other",
];

const emojis = ["🎬", "🎵", "🤖", "💻", "📝", "🎨", "🖼️", "📱", "🎮", "📚", "🏋️", "📰", "🎓", "☁️", "🔒", "📊"];

const emptySubscription: Omit<Subscription, "userId" | "createdAt"> = {
  id: "",
  emoji: "📱",
  name: "",
  category: "",
  monthlyCost: 0,
  currency: "USD",
  originalMonthlyCost: 0,
  renewalDate: "",
  hasStudentDiscount: false,
};

export default function Subscriptions() {
  const { user } = useAuth();
  const { t } = useI18n();
  const currency = useUserCurrency();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [newSubscription, setNewSubscription] = useState(emptySubscription);

  useEffect(() => {
    if (!user) {
      setSubscriptions([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadSubscriptions = async () => {
      setIsLoading(true);

      try {
        const data = await listSubscriptions(user.id);
        if (isMounted) {
          setSubscriptions(data);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadSubscriptions();

    const reload = () => {
      loadSubscriptions();
    };

    window.addEventListener("financialDataChanged", reload);

    return () => {
      isMounted = false;
      window.removeEventListener("financialDataChanged", reload);
    };
  }, [user]);

  const totalMonthlyCost = subscriptions.reduce(
    (total, subscription) => total + getSubscriptionAmountInCurrency(subscription, currency),
    0,
  );

  const handleAddSubscription = async () => {
    if (!user || !newSubscription.name || !newSubscription.category || !newSubscription.renewalDate) {
      return;
    }

    const created = await createSubscription(user.id, {
      emoji: newSubscription.emoji,
      name: newSubscription.name,
      category: newSubscription.category,
      monthlyCost: newSubscription.monthlyCost,
      currency,
      originalMonthlyCost: newSubscription.monthlyCost,
      renewalDate: newSubscription.renewalDate,
      hasStudentDiscount: newSubscription.hasStudentDiscount,
    });

    setSubscriptions([...subscriptions, created]);
    setShowAddModal(false);
    setNewSubscription(emptySubscription);
    window.dispatchEvent(new Event("financialDataChanged"));
  };

  const handleEditSubscription = async () => {
    if (!user || !editingSubscription) {
      return;
    }

    const updated = await updateSubscription(user.id, editingSubscription.id, {
      emoji: editingSubscription.emoji,
      name: editingSubscription.name,
      category: editingSubscription.category,
      monthlyCost: editingSubscription.monthlyCost,
      currency,
      originalMonthlyCost: editingSubscription.monthlyCost,
      renewalDate: editingSubscription.renewalDate,
      hasStudentDiscount: editingSubscription.hasStudentDiscount,
    });

    setSubscriptions(
      subscriptions.map((subscription) =>
        subscription.id === editingSubscription.id ? updated : subscription,
      ),
    );
    setShowEditModal(false);
    setEditingSubscription(null);
    window.dispatchEvent(new Event("financialDataChanged"));
  };

  const handleCancelSubscription = async (id: string) => {
    if (!user || !confirm(t("subscriptionsPage.confirmCancel"))) {
      return;
    }

    await removeSubscription(user.id, id);
    setSubscriptions(subscriptions.filter((subscription) => subscription.id !== id));
    window.dispatchEvent(new Event("financialDataChanged"));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2>{t("subscriptionsPage.title")}</h2>
            <p className="text-muted-foreground mt-1">{t("subscriptionsPage.subtitle")}</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Plus className="size-5" />
            {t("subscriptionsPage.addSubscription")}
          </button>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-1">{t("subscriptionsPage.totalMonthlyCost")}</p>
              <h1 className="text-4xl font-bold text-primary">{formatCurrency(totalMonthlyCost, currency)}</h1>
              <p className="text-sm text-muted-foreground mt-2">
                {t("subscriptionsPage.activeCount", {
                  count: subscriptions.length,
                  suffix: subscriptions.length !== 1 ? "s" : "",
                })}
              </p>
            </div>
            <img
              src={BRAND_LOGO_SRC}
              alt="Bambuu logo"
              className="h-16 w-16 object-contain"
            />
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="bg-card border border-border rounded-xl p-6 text-sm text-muted-foreground">
              {t("subscriptionsPage.loading")}
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-6 text-sm text-muted-foreground">
              {t("subscriptionsPage.empty")}
            </div>
          ) : (
            subscriptions.map((subscription) => (
              <div key={subscription.id} className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="text-5xl">{subscription.emoji}</div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{subscription.name}</h3>
                        <p className="text-sm text-muted-foreground">{subscription.category}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingSubscription({
                              ...subscription,
                              monthlyCost: subscription.originalMonthlyCost,
                              currency,
                              originalMonthlyCost: subscription.originalMonthlyCost,
                            });
                            setShowEditModal(true);
                          }}
                          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                        >
                          <Edit2 className="size-4" />
                          {t("subscriptionsPage.edit")}
                        </button>
                        <button
                          onClick={() => handleCancelSubscription(subscription.id)}
                          className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                        >
                          <X className="size-4" />
                          {t("subscriptionsPage.cancel")}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mt-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="size-4 text-muted-foreground" />
                        <span className="text-sm">
                          <span className="font-medium">{t("subscriptionsPage.monthlyCost")}</span>
                          <span className="ml-2 text-primary font-semibold">{formatCurrency(getSubscriptionAmountInCurrency(subscription, currency), currency)}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-muted-foreground" />
                        <span className="text-sm">
                          <span className="font-medium">{t("subscriptionsPage.renews")}</span>
                          <span className="ml-2">{formatDate(subscription.renewalDate)}</span>
                        </span>
                      </div>
                    </div>

                    {subscription.hasStudentDiscount ? (
                      <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-start gap-2">
                        <AlertCircle className="size-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-amber-700 dark:text-amber-300">{t("subscriptionsPage.studentDiscountAvailable")}</p>
                          <p className="text-amber-600 dark:text-amber-400 mt-1">
                            {t("subscriptionsPage.studentDiscountMessage", { name: subscription.name })}
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {showAddModal ? (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">{t("subscriptionsPage.addSubscription")}</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">{t("subscriptionsPage.icon")}</label>
                  <div className="grid grid-cols-8 gap-2">
                    {emojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setNewSubscription({ ...newSubscription, emoji })}
                        className={`text-2xl p-2 rounded-lg transition-all ${
                          newSubscription.emoji === emoji
                            ? "bg-primary/20 ring-2 ring-primary"
                            : "bg-muted hover:bg-muted/80"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">{t("subscriptionsPage.subscriptionName")}</label>
                  <input
                    type="text"
                    value={newSubscription.name}
                    onChange={(e) => setNewSubscription({ ...newSubscription, name: e.target.value })}
                    placeholder={t("subscriptionsPage.subscriptionPlaceholder")}
                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">{t("subscriptionsPage.category")}</label>
                  <select
                    value={newSubscription.category}
                    onChange={(e) => setNewSubscription({ ...newSubscription, category: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">{t("subscriptionsPage.selectCategory")}</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">{t("subscriptionsPage.monthlyCost")}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <input
                      type="number"
                      step="0.01"
                    value={newSubscription.monthlyCost || ""}
                    onChange={(e) =>
                      setNewSubscription({
                        ...newSubscription,
                        monthlyCost: parseFloat(e.target.value) || 0,
                        currency,
                        originalMonthlyCost: parseFloat(e.target.value) || 0,
                      })
                    }
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">{t("subscriptionsPage.nextRenewalDate")}</label>
                  <input
                    type="date"
                    value={newSubscription.renewalDate}
                    onChange={(e) => setNewSubscription({ ...newSubscription, renewalDate: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">{t("subscriptionsPage.hasStudentDiscount")}</label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("subscriptionsPage.studentPricingHelp")}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newSubscription.hasStudentDiscount}
                      onChange={(e) =>
                        setNewSubscription({
                          ...newSubscription,
                          hasStudentDiscount: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-muted rounded-full peer peer-checked:bg-primary peer-focus:ring-4 peer-focus:ring-primary/20 transition-colors relative">
                      <div className={`absolute top-0.5 left-0.5 bg-white rounded-full h-6 w-6 transition-transform ${newSubscription.hasStudentDiscount ? "translate-x-7" : ""}`}></div>
                    </div>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-muted text-foreground px-4 py-3 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    {t("subscriptionsPage.cancel")}
                  </button>
                  <button
                    onClick={handleAddSubscription}
                    className="flex-1 bg-primary text-primary-foreground px-4 py-3 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    {t("subscriptionsPage.addSubscription")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {showEditModal && editingSubscription ? (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">{t("subscriptionsPage.editSubscription")}</h3>
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
                <div>
                  <label className="text-sm font-medium mb-2 block">{t("subscriptionsPage.icon")}</label>
                  <div className="grid grid-cols-8 gap-2">
                    {emojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setEditingSubscription({ ...editingSubscription, emoji })}
                        className={`text-2xl p-2 rounded-lg transition-all ${
                          editingSubscription.emoji === emoji
                            ? "bg-primary/20 ring-2 ring-primary"
                            : "bg-muted hover:bg-muted/80"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">{t("subscriptionsPage.subscriptionName")}</label>
                  <input
                    type="text"
                    value={editingSubscription.name}
                    onChange={(e) =>
                      setEditingSubscription({ ...editingSubscription, name: e.target.value })
                    }
                    placeholder={t("subscriptionsPage.subscriptionPlaceholder")}
                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">{t("subscriptionsPage.category")}</label>
                  <select
                    value={editingSubscription.category}
                    onChange={(e) =>
                      setEditingSubscription({ ...editingSubscription, category: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">{t("subscriptionsPage.selectCategory")}</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">{t("subscriptionsPage.monthlyCost")}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <input
                      type="number"
                      step="0.01"
                    value={editingSubscription.originalMonthlyCost || ""}
                    onChange={(e) =>
                      setEditingSubscription({
                        ...editingSubscription,
                        monthlyCost: parseFloat(e.target.value) || 0,
                        currency,
                        originalMonthlyCost: parseFloat(e.target.value) || 0,
                      })
                    }
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">{t("subscriptionsPage.nextRenewalDate")}</label>
                  <input
                    type="date"
                    value={editingSubscription.renewalDate}
                    onChange={(e) =>
                      setEditingSubscription({
                        ...editingSubscription,
                        renewalDate: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">{t("subscriptionsPage.hasStudentDiscount")}</label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("subscriptionsPage.studentPricingHelp")}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingSubscription.hasStudentDiscount}
                      onChange={(e) =>
                        setEditingSubscription({
                          ...editingSubscription,
                          hasStudentDiscount: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-muted rounded-full peer peer-checked:bg-primary peer-focus:ring-4 peer-focus:ring-primary/20 transition-colors relative">
                      <div className={`absolute top-0.5 left-0.5 bg-white rounded-full h-6 w-6 transition-transform ${editingSubscription.hasStudentDiscount ? "translate-x-7" : ""}`}></div>
                    </div>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingSubscription(null);
                    }}
                    className="flex-1 bg-muted text-foreground px-4 py-3 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    {t("subscriptionsPage.cancel")}
                  </button>
                  <button
                    onClick={handleEditSubscription}
                    className="flex-1 bg-primary text-primary-foreground px-4 py-3 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    {t("subscriptionsPage.saveChanges")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  );
}
