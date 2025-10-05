// import { createContext, useContext, useState } from "react";
// import { en } from "../i18n/en";
// import { ar } from "../i18n/ar";

// const LanguageContext = createContext();

// export const LanguageProvider = ({ children }) => {
//   const [language, setLanguage] = useState("en"); // افتراضي انجليزي
//   const texts = language === "en" ? en : ar;

//   return (
//     <LanguageContext.Provider value={{ language, setLanguage, texts }}>
//       {children}
//     </LanguageContext.Provider>
//   );
// };
// export const useLanguage = () => useContext(LanguageContext);