import { ReactNode, useState, useEffect } from "react";
import { Link } from "react-router";
import { Plus, User } from "lucide-react";
import Navigation from "./Navigation";
import NotificationsPanel from "./NotificationsPanel";
import AddTransactionModal from "./AddTransactionModal";
import { useAuth } from "../providers/AuthProvider";
import { createTransaction } from "../lib/transactions";
import { getUserProfile, getUserSettings } from "../lib/settings";
import { BRAND_LOGO_SRC } from "../lib/branding";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [defaultCurrency, setDefaultCurrency] = useState("USD");

  useEffect(() => {
    if (!user) {
      setProfilePhoto(null);
      setDefaultCurrency("USD");
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
        }
      } catch {
        if (isMounted) {
          setProfilePhoto(null);
          setDefaultCurrency("USD");
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

  const handleAddTransaction = async (transaction: {
    name: string;
    amount: number;
    category: string;
    type: 'income' | 'expense';
    occurredOn: string;
    currency?: string;
    originalAmount?: number;
    isRecurring?: boolean;
    recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  }) => {
    if (!user) {
      return;
    }

    await createTransaction(user.id, transaction);
    window.dispatchEvent(new Event("transactionsChanged"));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Fixed at top */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground px-6 py-6 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="w-32"></div> {/* Spacer for balance */}
          <Link to="/" className="flex items-center gap-4">
            <div className="h-16 w-16 flex items-center justify-center">
              <img
                src={BRAND_LOGO_SRC}
                alt="Bambu logo"
                className="h-full w-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-semibold text-white">BAMBU</h1>
          </Link>
          <div className="flex items-center gap-3 w-32 justify-end">
            <NotificationsPanel />
            <button
              className="bg-white/20 hover:bg-white/30 px-4 py-3 rounded-lg transition-colors"
              onClick={() => setIsAddModalOpen(true)}
              aria-label="Add transaction"
            >
              <Plus className="size-6" />
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
      {children}

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
