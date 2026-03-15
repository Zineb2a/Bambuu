import { ReactNode, useState, useEffect } from "react";
import { Link } from "react-router";
import { Moon, Plus, Sun, User } from "lucide-react";
import Navigation from "./Navigation";
import NotificationsPanel from "./NotificationsPanel";
import AddTransactionModal from "./AddTransactionModal";
import { useAuth } from "../providers/AuthProvider";
import { useI18n } from "../providers/I18nProvider";
import { createTransaction } from "../lib/transactions";
import { getUserProfile, getUserSettings, updateUserSettings } from "../lib/settings";
import { BRAND_LOGO_SRC } from "../lib/branding";
import type { UserSettings } from "../types/settings";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const { t } = useI18n();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [defaultCurrency, setDefaultCurrency] = useState("USD");
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (!user) {
      setProfilePhoto(null);
      setDefaultCurrency("USD");
      setUserSettings(null);
      setDarkMode(false);
      return;
    }

    let isMounted = true;

    const loadProfile = async () => {
      try {
        const [profile, settings] = await Promise.all([
          getUserProfile(user.id, user.email ?? null),
          getUserSettings(user.id),
        ]);
        if (isMounted) {
          setProfilePhoto(profile.avatarUrl);
          setDefaultCurrency(settings.currency);
          setUserSettings(settings);
          setDarkMode(settings.darkMode);
        }
      } catch {
        if (isMounted) {
          setProfilePhoto(null);
          setDefaultCurrency("USD");
          setUserSettings(null);
          setDarkMode(false);
        }
      }
    };

    loadProfile();

    const handleProfileUpdated = () => {
      loadProfile();
    };

    window.addEventListener("profileUpdated", handleProfileUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener("profileUpdated", handleProfileUpdated);
    };
  }, [user]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const handleAddTransaction = async (transaction: {
    name: string;
    amount: number;
    category: string;
    type: 'income' | 'expense';
    occurredOn: string;
    currency?: string;
    originalAmount?: number;
    isRecurring?: boolean;
    recurringFrequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  }) => {
    if (!user) {
      return;
    }

    await createTransaction(user.id, transaction);
    window.dispatchEvent(new Event("transactionsChanged"));
  };

  const handleToggleDarkMode = async () => {
    if (!user || !userSettings) {
      return;
    }

    const nextDarkMode = !darkMode;
    setDarkMode(nextDarkMode);

    try {
      const saved = await updateUserSettings(user.id, {
        ...userSettings,
        darkMode: nextDarkMode,
      });
      setUserSettings(saved);
      setDarkMode(saved.darkMode);
      window.dispatchEvent(new Event("settingsUpdated"));
    } catch {
      setDarkMode(userSettings.darkMode);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Fixed at top */}
      <header className="fixed inset-x-0 top-0 z-50 h-28 bg-primary text-primary-foreground px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex h-full items-center justify-between">
          <div className="w-32"></div> {/* Spacer for balance */}
          <Link to="/" className="flex items-center gap-4">
            <div className="h-16 w-16 flex items-center justify-center">
              <img
                src={BRAND_LOGO_SRC}
                alt="Bambuu logo"
                className="h-full w-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-semibold text-white">BAMBUU</h1>
          </Link>
          <div className="flex items-center gap-3 w-40 justify-end">
            <NotificationsPanel />
            <button
              type="button"
              onClick={handleToggleDarkMode}
              aria-label={t("settingsPage.darkMode")}
              className="rounded-lg bg-white/20 p-2 hover:bg-white/30 transition-colors"
            >
              {darkMode ? <Sun className="size-5 text-white" /> : <Moon className="size-5 text-white" />}
            </button>
            <Link to="/settings" className="flex-shrink-0">
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Profile"
                  className="w-11 h-11 rounded-full object-cover border-2 border-white/30 hover:border-white/50 transition-colors cursor-pointer"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center cursor-pointer">
                  <User className="size-6 text-white" />
                </div>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="pt-[11.5rem]">
        {children}
      </main>

      {user ? (
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          aria-label={t("addTransaction.title")}
          className="fixed bottom-6 right-6 z-50 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-all hover:scale-105 hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-primary/25"
        >
          <Plus className="size-10" />
        </button>
      ) : null}

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTransaction={handleAddTransaction}
        defaultCurrency={defaultCurrency}
      />
    </div>
  );
}
