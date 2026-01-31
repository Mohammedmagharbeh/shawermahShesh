import { Package } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

function Header() {
  const { t } = useTranslation();
  return (
    <div className="border-b border-border/50 bg-card/50 w-full">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 sm:p-3 bg-primary rounded-lg sm:rounded-xl shadow-lg shadow-primary/20 flex-shrink-0">
            <Package className="h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
              {t("admin_panel")}
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 sm:mt-1">
              {t("admin_panel_desc")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
