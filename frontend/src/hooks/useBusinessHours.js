import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "../contexts/UserContext"; // Correct context path from hooks dir
import toast from "react-hot-toast";

export function useBusinessHours() {
  const { t } = useTranslation();
  const { logout, isAuthenticated, user } = useUser();

  useEffect(() => {
    const checkBanTime = () => {
      const hour = new Date().getHours();

      // Restaurant closed between 3 AM and 10 AM
      const isBanTime = hour >= 3 && hour < 10;

      if (isBanTime && isAuthenticated && user?.role !== "admin") {
        logout();
        toast.error(t("restaurant_closed_msg"), {
          id: "force-logout-toast",
          icon: "🌙",
          duration: 8000,
          style: {
            borderRadius: "12px",
            background: "#1e1e2e",
            color: "#fff",
            border: "1px solid #ff4b4b",
          },
        });
      }
    };

    checkBanTime();
    // Check every minute
    const timer = setInterval(checkBanTime, 60000);

    return () => clearInterval(timer);
  }, [isAuthenticated, logout, user, t]);

  return;
}
