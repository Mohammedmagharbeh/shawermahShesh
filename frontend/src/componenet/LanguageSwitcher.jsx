import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // set document direction and lang attr whenever language changes
    const dir = i18n.language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = dir;
    // optional: change font for Arabic
    if (i18n.language === "ar") {
      document.documentElement.style.fontFamily = "'Cairo', sans-serif";
    } else {
      document.documentElement.style.fontFamily = "'Inter', sans-serif";
    }
  }, [i18n.language]);

  const changeLang = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("i18nextLng", lng);
  };

  return (
    <div className="flex gap-2 size-10">
      <button onClick={() => changeLang("en")} className="btn">
        EN
      </button>
      <button onClick={() => changeLang("ar")} className="btn">
        ع
      </button>
    </div>
  );
}
