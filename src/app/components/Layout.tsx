import { ReactNode, useState, useEffect } from "react";
import { Link } from "react-router";
import { Plus, User } from "lucide-react";
import Navigation from "./Navigation";
import NotificationsPanel from "./NotificationsPanel";
import AddTransactionModal from "./AddTransactionModal";
import { useAuth } from "../providers/AuthProvider";
import { createTransaction } from "../lib/transactions";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    // Load profile photo from localStorage
    const photo = localStorage.getItem("userPhoto");
    setProfilePhoto(photo);

    // Listen for storage changes to update photo in real-time
    const handleStorageChange = () => {
      const updatedPhoto = localStorage.getItem("userPhoto");
      setProfilePhoto(updatedPhoto);
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Custom event for same-tab updates
    window.addEventListener("profilePhotoUpdated" as any, handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("profilePhotoUpdated" as any, handleStorageChange);
    };
  }, []);

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
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground px-6 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="w-24"></div> {/* Spacer for balance */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">🐼</span>
            </div>
            <h1 className="text-white">Bambu</h1>
          </Link>
          <div className="flex items-center gap-3 w-24 justify-end">
            <NotificationsPanel />
            <button
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
              onClick={() => setIsAddModalOpen(true)}
              aria-label="Add transaction"
            >
              <Plus className="size-5" />
            </button>
            <Link to="/settings" className="flex-shrink-0">
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Profile"
                  className="w-9 h-9 rounded-full object-cover border-2 border-white/30 hover:border-white/50 transition-colors cursor-pointer"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center cursor-pointer">
                  <User className="size-5 text-white" />
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
      />
    </div>
  );
}
