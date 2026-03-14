import { useEffect, useState } from "react";
import { getUserSettings } from "../lib/settings";
import { useAuth } from "../providers/AuthProvider";

export function useUserCurrency() {
  const { user } = useAuth();
  const [currency, setCurrency] = useState("USD");

  useEffect(() => {
    if (!user) {
      setCurrency("USD");
      return;
    }

    let isMounted = true;

    const loadCurrency = async () => {
      try {
        const settings = await getUserSettings(user.id);
        if (isMounted) {
          setCurrency(settings.currency);
        }
      } catch {
        if (isMounted) {
          setCurrency("USD");
        }
      }
    };

    loadCurrency();

    const handleSettingsUpdated = () => {
      loadCurrency();
    };

    window.addEventListener("settingsUpdated", handleSettingsUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener("settingsUpdated", handleSettingsUpdated);
    };
  }, [user]);

  return currency;
}
