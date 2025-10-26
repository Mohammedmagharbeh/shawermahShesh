import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // set document direction and lang attr whenever language changes
    const dir = i18n.language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = dir;
    // optional: change font for Arabic
    if (i18n.language === "ar") {
      document.documentElement.style.fontFamily = "'STC', sans-serif";
    } else {
      document.documentElement.style.fontFamily =
        "'Baloo Tammudu 2'";
    }
  }, [i18n.language]);

  const changeLang = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("i18nextLng", lng);
  };

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <div className="flex items-center gap-1 bg-white rounded-lg p-1 border-2 border-red-600 shadow-md">
        <button
          onClick={() => changeLang("en")}
          className={`
            px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 
            text-xs sm:text-sm md:text-base font-bold 
            rounded-md transition-all duration-300
            ${
              i18n.language === "en"
                ? "bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg scale-105"
                : "bg-transparent text-red-700 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-red-50"
            }
          `}
          aria-label="Switch to English"
        >
          EN
        </button>

        <div className="w-px h-6 bg-red-300" />

        <button
          onClick={() => changeLang("ar")}
          className={`
            px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 
            text-xs sm:text-sm md:text-base font-bold 
            rounded-md transition-all duration-300
            ${
              i18n.language === "ar"
                ? "bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg scale-105"
                : "bg-transparent text-red-700 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-red-50"
            }
          `}
          aria-label="التبديل إلى العربية"
        >
          ع
        </button>
      </div>
    </div>
  );
}

export default React.memo(LanguageSwitcher);
