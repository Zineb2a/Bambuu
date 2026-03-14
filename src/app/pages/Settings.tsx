import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  User,
  Check,
  LogOut,
  Languages,
  Moon,
  Sun,
  CreditCard,
  Plus,
  Trash2,
  X,
  Bell,
  Lock,
  AlertTriangle,
  Calendar,
  Camera,
  DollarSign,
} from "lucide-react";
import Layout from "../components/Layout";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../providers/AuthProvider";
import { BRAND_LOGO_SRC } from "../lib/branding";
import {
  createLinkedCard,
  getUserProfile,
  getUserSettings,
  listLinkedCards,
  removeLinkedCard,
  updateLinkedCard,
  updateUserProfile,
  updateUserSettings,
} from "../lib/settings";
import type { LinkedCard } from "../types/settings";

const languages = [
  "English",
  "Español",
  "Français",
  "Deutsch",
  "Português",
  "中文",
  "日本語",
  "한국어",
  "العربية",
];

const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "MXN", symbol: "$", name: "Mexican Peso" },
];

const dateFormats = ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY/MM/DD"];

const emptyCard = {
  cardNumber: "",
  cardHolder: "",
  cardType: "debit" as "credit" | "debit",
  bankName: "",
  autoImport: true,
};

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [language, setLanguage] = useState("English");
  const [currency, setCurrency] = useState("USD");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const [darkMode, setDarkMode] = useState(false);
  const [savedNotification, setSavedNotification] = useState("");
  const [errorNotification, setErrorNotification] = useState("");
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [subscriptionReminders, setSubscriptionReminders] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(true);
  const [savingsMilestones, setSavingsMilestones] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [linkedCards, setLinkedCards] = useState<LinkedCard[]>([]);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [newCard, setNewCard] = useState(emptyCard);

  const splitFullName = (fullName: string) => {
    const trimmed = fullName.trim();
    if (!trimmed) {
      return { firstName: "", lastName: "" };
    }

    const parts = trimmed.split(/\s+/);
    return {
      firstName: parts[0] ?? "",
      lastName: parts.slice(1).join(" "),
    };
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadSettings = async () => {
      setIsLoading(true);
      setErrorNotification("");

      try {
        const [profile, settings, cards] = await Promise.all([
          getUserProfile(user.id, user.email ?? null),
          getUserSettings(user.id),
          listLinkedCards(user.id),
        ]);

        if (!isMounted) {
          return;
        }

        const fallbackFullName =
          profile.fullName ??
          (typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "");
        const parsedName = splitFullName(fallbackFullName);

        setProfilePhoto(profile.avatarUrl);
        setFirstName(profile.firstName ?? parsedName.firstName);
        setLastName(profile.lastName ?? parsedName.lastName);
        setEmail(profile.email ?? user.email ?? "");
        setLanguage(settings.language);
        setCurrency(settings.currency);
        setDateFormat(settings.dateFormat);
        setDarkMode(settings.darkMode);
        setBudgetAlerts(settings.budgetAlerts);
        setSubscriptionReminders(settings.subscriptionReminders);
        setWeeklySummary(settings.weeklySummary);
        setSavingsMilestones(settings.savingsMilestones);
        setLinkedCards(cards);
      } catch (error) {
        if (isMounted) {
          setErrorNotification(error instanceof Error ? error.message : "Failed to load settings");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const showSaved = (message: string) => {
    setSavedNotification(message);
    setTimeout(() => setSavedNotification(""), 3000);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!user) {
      return;
    }

    setErrorNotification("");

    try {
      await updateUserProfile(
        user.id,
        {
          firstName,
          lastName,
          avatarUrl: profilePhoto,
        },
        email,
      );

      const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
      const authUpdates: {
        email?: string;
        data?: {
          full_name: string | null;
        };
      } = {
        data: {
          full_name: fullName || null,
        },
      };

      if (email && email !== user.email) {
        authUpdates.email = email;
      }

      const { error } = await supabase.auth.updateUser(authUpdates);
      if (error) {
        throw error;
      }

      window.dispatchEvent(new Event("profileUpdated"));
      showSaved(
        authUpdates.email
          ? "Profile saved. Check your email if Supabase requires email change confirmation."
          : "Profile saved successfully.",
      );
    } catch (error) {
      setErrorNotification(error instanceof Error ? error.message : "Failed to save profile");
    }
  };

  const persistPreferences = async (overrides?: Partial<{
    language: string;
    currency: string;
    dateFormat: string;
    darkMode: boolean;
    budgetAlerts: boolean;
    subscriptionReminders: boolean;
    weeklySummary: boolean;
    savingsMilestones: boolean;
  }>) => {
    if (!user) {
      return;
    }

    const next = {
      language,
      currency,
      dateFormat,
      darkMode,
      budgetAlerts,
      subscriptionReminders,
      weeklySummary,
      savingsMilestones,
      ...overrides,
    };

    try {
      const saved = await updateUserSettings(user.id, next);
      setLanguage(saved.language);
      setCurrency(saved.currency);
      setDateFormat(saved.dateFormat);
      setDarkMode(saved.darkMode);
      setBudgetAlerts(saved.budgetAlerts);
      setSubscriptionReminders(saved.subscriptionReminders);
      setWeeklySummary(saved.weeklySummary);
      setSavingsMilestones(saved.savingsMilestones);
      window.dispatchEvent(new Event("settingsUpdated"));
    } catch (error) {
      setErrorNotification(error instanceof Error ? error.message : "Failed to update settings");
    }
  };

  const handleLogout = async () => {
    setErrorNotification("");

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    } catch (error) {
      setErrorNotification(error instanceof Error ? error.message : "Failed to log out");
      return;
    }

    localStorage.removeItem("supabase.auth.token");
    sessionStorage.clear();
    navigate("/auth", { replace: true });
    window.location.assign("/auth");
  };

  const handleAddCard = async () => {
    if (!user || !newCard.cardNumber || !newCard.cardHolder || !newCard.bankName) {
      return;
    }

    try {
      const created = await createLinkedCard(user.id, newCard);
      setLinkedCards([...linkedCards, created]);
      setShowAddCardModal(false);
      setNewCard(emptyCard);
      showSaved("Card linked successfully.");
    } catch (error) {
      setErrorNotification(error instanceof Error ? error.message : "Failed to add card");
    }
  };

  const handleDeleteCard = async (id: string) => {
    if (!user) {
      return;
    }

    try {
      await removeLinkedCard(user.id, id);
      setLinkedCards(linkedCards.filter((card) => card.id !== id));
    } catch (error) {
      setErrorNotification(error instanceof Error ? error.message : "Failed to remove card");
    }
  };

  const toggleAutoImport = async (id: string) => {
    if (!user) {
      return;
    }

    const card = linkedCards.find((item) => item.id === id);
    if (!card) {
      return;
    }

    try {
      const updated = await updateLinkedCard(user.id, id, {
        autoImport: !card.autoImport,
      });
      setLinkedCards(linkedCards.map((item) => (item.id === id ? updated : item)));
    } catch (error) {
      setErrorNotification(error instanceof Error ? error.message : "Failed to update card");
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword) {
      setErrorNotification("Enter a new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorNotification("New password and confirmation do not match.");
      return;
    }

    try {
      await supabase.auth.updateUser({ password: newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showSaved("Password updated successfully.");
    } catch (error) {
      setErrorNotification(error instanceof Error ? error.message : "Failed to update password");
    }
  };

  const maskCardNumber = (cardNumber: string) => {
    const last4 = cardNumber.slice(-4);
    return `•••• •••• •••• ${last4}`;
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2>Settings</h2>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <LogOut className="size-4" />
            Logout
          </button>
        </div>

        {savedNotification ? (
          <div className="bg-primary text-primary-foreground px-4 py-3 rounded-lg flex items-center gap-2 animate-in slide-in-from-top">
            <Check className="size-5" />
            {savedNotification}
          </div>
        ) : null}

        {errorNotification ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errorNotification}
          </div>
        ) : null}

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <User className="size-5 text-primary" />
            <h3>Profile</h3>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center overflow-hidden border-4 border-border">
                  {profilePhoto ? <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" /> : <span className="text-4xl"></span>}
                </div>
                <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:opacity-90 transition-opacity shadow-lg">
                  <Camera className="size-4" />
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>
              <div>
                <h4 className="mb-1">Profile Picture</h4>
                <p className="text-sm text-muted-foreground">Upload a photo to personalize your account</p>
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Your first name"
                className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Your last name"
                className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Check className="size-5" />
              Save Profile Changes
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Languages className="size-5 text-primary" />
            <h3>Language</h3>
          </div>

          <select
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              void persistPreferences({ language: e.target.value });
            }}
            className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="size-5 text-primary" />
            <h3>Default Currency</h3>
          </div>

          <select
            value={currency}
            onChange={(e) => {
              setCurrency(e.target.value);
              void persistPreferences({ currency: e.target.value });
            }}
            className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {currencies.map((curr) => (
              <option key={curr.code} value={curr.code}>
                {curr.code} ({curr.symbol}) - {curr.name}
              </option>
            ))}
          </select>
          <p className="text-sm text-muted-foreground mt-2">All amounts will be displayed in your default currency</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="size-5 text-primary" />
            <h3>Date Format</h3>
          </div>

          <select
            value={dateFormat}
            onChange={(e) => {
              setDateFormat(e.target.value);
              void persistPreferences({ dateFormat: e.target.value });
            }}
            className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {dateFormats.map((formatOption) => (
              <option key={formatOption} value={formatOption}>
                {formatOption}
              </option>
            ))}
          </select>
          <p className="text-sm text-muted-foreground mt-2">Choose the date format you prefer</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {darkMode ? <Moon className="size-5 text-primary" /> : <Sun className="size-5 text-primary" />}
              <div>
                <h3>Dark Mode</h3>
                <p className="text-sm text-muted-foreground mt-1">Switch between light and dark themes</p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => {
                  setDarkMode(e.target.checked);
                  void persistPreferences({ darkMode: e.target.checked });
                }}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-muted rounded-full peer peer-checked:bg-primary peer-focus:ring-4 peer-focus:ring-primary/20 transition-colors relative">
                <div className={`absolute top-0.5 left-0.5 bg-white rounded-full h-6 w-6 transition-transform ${darkMode ? "translate-x-7" : ""}`}></div>
              </div>
            </label>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="size-5 text-primary" />
            <h3>Linked Cards</h3>
          </div>

          <div className="space-y-4">
            {linkedCards.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="size-12 mx-auto mb-3 opacity-50" />
                <p>No cards linked yet</p>
                <p className="text-sm mt-1">Add a card to enable automatic expense tracking</p>
              </div>
            ) : (
              linkedCards.map((card) => (
                <div
                  key={card.id}
                  className={`relative rounded-xl p-6 text-white shadow-lg overflow-hidden ${
                    card.cardType === "credit" ? "bg-gradient-to-br from-purple-600 to-purple-800" : "bg-gradient-to-br from-blue-600 to-blue-800"
                  }`}
                  style={{ minHeight: "180px" }}
                >
                  <div className="absolute top-4 right-4 opacity-20">
                    <CreditCard className="size-16" />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <div className="text-sm font-medium opacity-90">{card.bankName}</div>
                      <div className="text-xs bg-white/20 px-2 py-1 rounded">{card.cardType.toUpperCase()}</div>
                    </div>

                    <div className="font-mono text-lg mb-6 tracking-wider">{maskCardNumber(card.cardNumber)}</div>

                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-xs opacity-70 mb-1">CARDHOLDER</div>
                        <div className="text-sm font-medium">{card.cardHolder.toUpperCase()}</div>
                      </div>

                      <div className="flex gap-2">
                        <label className="flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-2 rounded-lg cursor-pointer hover:bg-white/20 transition-colors">
                          <input
                            type="checkbox"
                            checked={card.autoImport}
                            onChange={() => toggleAutoImport(card.id)}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-white/20 rounded-full peer-checked:bg-primary transition-colors relative">
                            <div className={`absolute top-0.5 left-0.5 bg-white rounded-full h-4 w-4 transition-transform ${card.autoImport ? "translate-x-5" : ""}`}></div>
                          </div>
                          <span className="text-xs">Auto</span>
                        </label>

                        <button
                          onClick={() => handleDeleteCard(card.id)}
                          className="bg-white/10 backdrop-blur px-3 py-2 rounded-lg hover:bg-red-500/80 transition-colors"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

            <button
              onClick={() => setShowAddCardModal(true)}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Plus className="size-5" />
              Link New Card
            </button>

            <p className="text-xs text-muted-foreground text-center mt-2">
              Card information is stored in your account. Enable auto-import to automatically register expenses from linked cards.
            </p>
          </div>
        </div>

        {showAddCardModal ? (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-card border border-border rounded-xl p-6 w-96">
              <div className="flex items-center justify-between">
                <h3>Add Card</h3>
                <button
                  onClick={() => setShowAddCardModal(false)}
                  className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Card Number</label>
                  <input
                    type="text"
                    value={newCard.cardNumber}
                    onChange={(e) => setNewCard({ ...newCard, cardNumber: e.target.value })}
                    placeholder="Card Number"
                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Card Holder</label>
                  <input
                    type="text"
                    value={newCard.cardHolder}
                    onChange={(e) => setNewCard({ ...newCard, cardHolder: e.target.value })}
                    placeholder="Card Holder"
                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Card Type</label>
                  <select
                    value={newCard.cardType}
                    onChange={(e) => setNewCard({ ...newCard, cardType: e.target.value as "credit" | "debit" })}
                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Bank Name</label>
                  <input
                    type="text"
                    value={newCard.bankName}
                    onChange={(e) => setNewCard({ ...newCard, bankName: e.target.value })}
                    placeholder="Bank Name"
                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Auto Import</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newCard.autoImport}
                      onChange={(e) => setNewCard({ ...newCard, autoImport: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-muted rounded-full peer peer-checked:bg-primary peer-focus:ring-4 peer-focus:ring-primary/20 transition-colors relative">
                      <div className={`absolute top-0.5 left-0.5 bg-white rounded-full h-6 w-6 transition-transform ${newCard.autoImport ? "translate-x-7" : ""}`}></div>
                    </div>
                  </label>
                </div>

                <button
                  onClick={handleAddCard}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Check className="size-5" />
                  Add Card
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="size-5 text-primary" />
            <h3>Notifications</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">Budget Alert Notifications</h4>
                <p className="text-xs text-muted-foreground mt-1">Get notified when you reach 80% of your budget</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={budgetAlerts}
                  onChange={(e) => {
                    setBudgetAlerts(e.target.checked);
                    void persistPreferences({ budgetAlerts: e.target.checked });
                  }}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-muted rounded-full peer peer-checked:bg-primary peer-focus:ring-4 peer-focus:ring-primary/20 transition-colors relative">
                  <div className={`absolute top-0.5 left-0.5 bg-white rounded-full h-6 w-6 transition-transform ${budgetAlerts ? "translate-x-7" : ""}`}></div>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">Subscription Reminders</h4>
                <p className="text-xs text-muted-foreground mt-1">Remind me 3 days before subscription renewals</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={subscriptionReminders}
                  onChange={(e) => {
                    setSubscriptionReminders(e.target.checked);
                    void persistPreferences({ subscriptionReminders: e.target.checked });
                  }}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-muted rounded-full peer peer-checked:bg-primary peer-focus:ring-4 peer-focus:ring-primary/20 transition-colors relative">
                  <div className={`absolute top-0.5 left-0.5 bg-white rounded-full h-6 w-6 transition-transform ${subscriptionReminders ? "translate-x-7" : ""}`}></div>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">Weekly Summary</h4>
                <p className="text-xs text-muted-foreground mt-1">Receive weekly spending summary emails</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={weeklySummary}
                  onChange={(e) => {
                    setWeeklySummary(e.target.checked);
                    void persistPreferences({ weeklySummary: e.target.checked });
                  }}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-muted rounded-full peer peer-checked:bg-primary peer-focus:ring-4 peer-focus:ring-primary/20 transition-colors relative">
                  <div className={`absolute top-0.5 left-0.5 bg-white rounded-full h-6 w-6 transition-transform ${weeklySummary ? "translate-x-7" : ""}`}></div>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">Savings Milestones</h4>
                <p className="text-xs text-muted-foreground mt-1">Celebrate when you reach savings goals</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={savingsMilestones}
                  onChange={(e) => {
                    setSavingsMilestones(e.target.checked);
                    void persistPreferences({ savingsMilestones: e.target.checked });
                  }}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-muted rounded-full peer peer-checked:bg-primary peer-focus:ring-4 peer-focus:ring-primary/20 transition-colors relative">
                  <div className={`absolute top-0.5 left-0.5 bg-white rounded-full h-6 w-6 transition-transform ${savingsMilestones ? "translate-x-7" : ""}`}></div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="size-5 text-primary" />
            <h3>Security</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
                className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button
              onClick={handleUpdatePassword}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Check className="size-5" />
              Update Password
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="size-5 text-primary" />
            <h3>Delete Account</h3>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Deleting your account will permanently remove all your data. This action cannot be undone.
            </p>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full bg-destructive text-destructive-foreground py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Trash2 className="size-5" />
              Delete Account
            </button>

            {showDeleteConfirm ? (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-card border border-border rounded-xl p-6 w-96">
                  <div className="flex items-center justify-between">
                    <h3>Confirm Deletion</h3>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  <div className="space-y-4 mt-4">
                    <p className="text-sm text-muted-foreground">
                      Self-serve account deletion is not wired yet. This currently needs a server-side admin flow.
                    </p>

                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="w-full bg-muted text-foreground py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="bg-secondary border border-primary/20 rounded-xl p-6 text-center">
          <img
            src={BRAND_LOGO_SRC}
            alt="Bambu logo"
            className="mx-auto mb-2 h-12 w-12 object-contain"
          />
          <h4 className="mb-2 text-primary">Bambu v1.0</h4>
          <p className="text-sm text-muted-foreground">Your friendly student budget tracker</p>
        </div>
      </div>
    </Layout>
  );
}
