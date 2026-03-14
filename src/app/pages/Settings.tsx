import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { 
  User, 
  Globe, 
  DollarSign, 
  Camera, 
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
  Mail,
  Calendar
} from "lucide-react";
import Layout from "../components/Layout";

export default function Settings() {
  const navigate = useNavigate();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(
    localStorage.getItem("userPhoto") || null
  );
  
  // Split name into first and last
  const [firstName, setFirstName] = useState(localStorage.getItem("userFirstName") || "");
  const [lastName, setLastName] = useState(localStorage.getItem("userLastName") || "");
  const [email, setEmail] = useState(localStorage.getItem("userEmail") || "");
  
  const [language, setLanguage] = useState(localStorage.getItem("userLanguage") || "English");
  const [currency, setCurrency] = useState(localStorage.getItem("userCurrency") || "USD");
  const [dateFormat, setDateFormat] = useState(localStorage.getItem("userDateFormat") || "MM/DD/YYYY");
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");
  const [savedNotification, setSavedNotification] = useState(false);

  // Notification preferences
  const [budgetAlerts, setBudgetAlerts] = useState(localStorage.getItem("budgetAlerts") !== "false");
  const [subscriptionReminders, setSubscriptionReminders] = useState(localStorage.getItem("subscriptionReminders") !== "false");
  const [weeklySummary, setWeeklySummary] = useState(localStorage.getItem("weeklySummary") !== "false");
  const [savingsMilestones, setSavingsMilestones] = useState(localStorage.getItem("savingsMilestones") !== "false");

  // Security
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Linked Cards State
  interface LinkedCard {
    id: string;
    cardNumber: string;
    cardHolder: string;
    cardType: 'credit' | 'debit';
    bankName: string;
    autoImport: boolean;
  }

  const [linkedCards, setLinkedCards] = useState<LinkedCard[]>(() => {
    const saved = localStorage.getItem("linkedCards");
    return saved ? JSON.parse(saved) : [];
  });
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    cardHolder: '',
    cardType: 'debit' as 'credit' | 'debit',
    bankName: '',
    autoImport: true
  });

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

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

  const dateFormats = [
    "MM/DD/YYYY",
    "DD/MM/YYYY",
    "YYYY/MM/DD"
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfilePhoto(result);
        localStorage.setItem("userPhoto", result);
        // Dispatch custom event to update header immediately
        window.dispatchEvent(new Event("profilePhotoUpdated"));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    localStorage.setItem("userFirstName", firstName);
    localStorage.setItem("userLastName", lastName);
    localStorage.setItem("userEmail", email);
    if (profilePhoto) {
      localStorage.setItem("userPhoto", profilePhoto);
      // Dispatch custom event to update header immediately
      window.dispatchEvent(new Event("profilePhotoUpdated"));
    }
    
    // Also update userName for backward compatibility with existing pages
    localStorage.setItem("userName", `${firstName} ${lastName}`);
    
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  // Auto-save handlers for other settings
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    localStorage.setItem("userLanguage", newLanguage);
  };

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    localStorage.setItem("userCurrency", newCurrency);
  };

  const handleDateFormatChange = (newFormat: string) => {
    setDateFormat(newFormat);
    localStorage.setItem("userDateFormat", newFormat);
  };

  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked);
    localStorage.setItem("darkMode", checked.toString());
  };

  const handleBudgetAlertsToggle = (checked: boolean) => {
    setBudgetAlerts(checked);
    localStorage.setItem("budgetAlerts", checked.toString());
  };

  const handleSubscriptionRemindersToggle = (checked: boolean) => {
    setSubscriptionReminders(checked);
    localStorage.setItem("subscriptionReminders", checked.toString());
  };

  const handleWeeklySummaryToggle = (checked: boolean) => {
    setWeeklySummary(checked);
    localStorage.setItem("weeklySummary", checked.toString());
  };

  const handleSavingsMilestonesToggle = (checked: boolean) => {
    setSavingsMilestones(checked);
    localStorage.setItem("savingsMilestones", checked.toString());
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/auth");
  };

  const handleAddCard = () => {
    const newCardWithId: LinkedCard = {
      id: Date.now().toString(),
      ...newCard
    };
    setLinkedCards([...linkedCards, newCardWithId]);
    localStorage.setItem("linkedCards", JSON.stringify([...linkedCards, newCardWithId]));
    setShowAddCardModal(false);
    // Reset form
    setNewCard({
      cardNumber: '',
      cardHolder: '',
      cardType: 'debit',
      bankName: '',
      autoImport: true
    });
  };

  const handleDeleteCard = (id: string) => {
    const updatedCards = linkedCards.filter(card => card.id !== id);
    setLinkedCards(updatedCards);
    localStorage.setItem("linkedCards", JSON.stringify(updatedCards));
  };

  const toggleAutoImport = (id: string) => {
    const updatedCards = linkedCards.map(card => 
      card.id === id ? { ...card, autoImport: !card.autoImport } : card
    );
    setLinkedCards(updatedCards);
    localStorage.setItem("linkedCards", JSON.stringify(updatedCards));
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

        {/* Save Notification */}
        {savedNotification && (
          <div className="bg-primary text-primary-foreground px-4 py-3 rounded-lg flex items-center gap-2 animate-in slide-in-from-top">
            <Check className="size-5" />
            Settings saved successfully!
          </div>
        )}

        {/* Profile Section */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <User className="size-5 text-primary" />
            <h3>Profile</h3>
          </div>

          <div className="space-y-6">
            {/* Profile Photo */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center overflow-hidden border-4 border-border">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl"></span>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:opacity-90 transition-opacity shadow-lg">
                  <Camera className="size-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <h4 className="mb-1">Profile Picture</h4>
                <p className="text-sm text-muted-foreground">
                  Upload a photo to personalize your account
                </p>
              </div>
            </div>

            {/* Name */}
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

            {/* Email */}
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

            {/* Save Profile Button */}
            <button
              onClick={handleSave}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Check className="size-5" />
              Save Profile Changes
            </button>
          </div>
        </div>

        {/* Language Selection */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Languages className="size-5 text-primary" />
            <h3>Language</h3>
          </div>

          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        {/* Currency Selection */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="size-5 text-primary" />
            <h3>Default Currency</h3>
          </div>

          <select
            value={currency}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {currencies.map((curr) => (
              <option key={curr.code} value={curr.code}>
                {curr.code} ({curr.symbol}) - {curr.name}
              </option>
            ))}
          </select>
          <p className="text-sm text-muted-foreground mt-2">
            All amounts will be displayed in your default currency
          </p>
        </div>

        {/* Date Format Selection */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="size-5 text-primary" />
            <h3>Date Format</h3>
          </div>

          <select
            value={dateFormat}
            onChange={(e) => handleDateFormatChange(e.target.value)}
            className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {dateFormats.map((format) => (
              <option key={format} value={format}>
                {format}
              </option>
            ))}
          </select>
          <p className="text-sm text-muted-foreground mt-2">
            Choose the date format you prefer
          </p>
        </div>

        {/* Dark Mode Toggle */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {darkMode ? (
                <Moon className="size-5 text-primary" />
              ) : (
                <Sun className="size-5 text-primary" />
              )}
              <div>
                <h3>Dark Mode</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Switch between light and dark themes
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => handleDarkModeToggle(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-muted rounded-full peer peer-checked:bg-primary peer-focus:ring-4 peer-focus:ring-primary/20 transition-colors relative">
                <div className={`absolute top-0.5 left-0.5 bg-white rounded-full h-6 w-6 transition-transform ${darkMode ? 'translate-x-7' : ''}`}></div>
              </div>
            </label>
          </div>
        </div>

        {/* Linked Cards Section */}
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
              linkedCards.map(card => (
                <div 
                  key={card.id} 
                  className={`relative rounded-xl p-6 text-white shadow-lg overflow-hidden ${
                    card.cardType === 'credit' ? 'bg-gradient-to-br from-purple-600 to-purple-800' : 'bg-gradient-to-br from-blue-600 to-blue-800'
                  }`}
                  style={{ minHeight: '180px' }}
                >
                  {/* Card decoration */}
                  <div className="absolute top-4 right-4 opacity-20">
                    <CreditCard className="size-16" />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <div className="text-sm font-medium opacity-90">{card.bankName}</div>
                      <div className="text-xs bg-white/20 px-2 py-1 rounded">
                        {card.cardType.toUpperCase()}
                      </div>
                    </div>

                    <div className="font-mono text-lg mb-6 tracking-wider">
                      {maskCardNumber(card.cardNumber)}
                    </div>

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
                            <div className={`absolute top-0.5 left-0.5 bg-white rounded-full h-4 w-4 transition-transform ${card.autoImport ? 'translate-x-5' : ''}`}></div>
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
              🔒 Card information is stored securely on your device. Enable auto-import to automatically register expenses from linked cards.
            </p>
          </div>
        </div>

        {/* Add Card Modal */}
        {showAddCardModal && (
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
                    onChange={(e) => setNewCard({ ...newCard, cardType: e.target.value as 'credit' | 'debit' })}
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
                      <div className={`absolute top-0.5 left-0.5 bg-white rounded-full h-6 w-6 transition-transform ${newCard.autoImport ? 'translate-x-7' : ''}`}></div>
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
        )}

        {/* Notification Preferences */}
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
                  onChange={(e) => handleBudgetAlertsToggle(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-muted rounded-full peer peer-checked:bg-primary peer-focus:ring-4 peer-focus:ring-primary/20 transition-colors relative">
                  <div className={`absolute top-0.5 left-0.5 bg-white rounded-full h-6 w-6 transition-transform ${budgetAlerts ? 'translate-x-7' : ''}`}></div>
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
                  onChange={(e) => handleSubscriptionRemindersToggle(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-muted rounded-full peer peer-checked:bg-primary peer-focus:ring-4 peer-focus:ring-primary/20 transition-colors relative">
                  <div className={`absolute top-0.5 left-0.5 bg-white rounded-full h-6 w-6 transition-transform ${subscriptionReminders ? 'translate-x-7' : ''}`}></div>
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
                  onChange={(e) => handleWeeklySummaryToggle(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-muted rounded-full peer peer-checked:bg-primary peer-focus:ring-4 peer-focus:ring-primary/20 transition-colors relative">
                  <div className={`absolute top-0.5 left-0.5 bg-white rounded-full h-6 w-6 transition-transform ${weeklySummary ? 'translate-x-7' : ''}`}></div>
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
                  onChange={(e) => handleSavingsMilestonesToggle(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-muted rounded-full peer peer-checked:bg-primary peer-focus:ring-4 peer-focus:ring-primary/20 transition-colors relative">
                  <div className={`absolute top-0.5 left-0.5 bg-white rounded-full h-6 w-6 transition-transform ${savingsMilestones ? 'translate-x-7' : ''}`}></div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Security Section */}
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
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Check className="size-5" />
              Update Password
            </button>
          </div>
        </div>

        {/* Delete Account */}
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

            {showDeleteConfirm && (
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
                      Are you sure you want to delete your account? This action cannot be undone.
                    </p>

                    <button
                      className="w-full bg-destructive text-destructive-foreground py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                      <Trash2 className="size-5" />
                      Confirm Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* App Info */}
        <div className="bg-secondary border border-primary/20 rounded-xl p-6 text-center">
          <div className="text-4xl mb-2">🐼🎋</div>
          <h4 className="mb-2 text-primary">Bambu v1.0</h4>
          <p className="text-sm text-muted-foreground">
            Your friendly student budget tracker
          </p>
        </div>
      </div>
    </Layout>
  );
}