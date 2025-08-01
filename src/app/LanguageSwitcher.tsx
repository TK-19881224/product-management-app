// components/LanguageSwitcher.tsx
"use client";

import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: "ja" | "en") => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => changeLanguage("ja")}
        className={`px-3 py-1 rounded text-sm border ${i18n.language === "ja" ? "bg-blue-500 text-white" : "bg-white text-gray-700 border-gray-300"}`}
      >
        日本語
      </button>
      <button
        onClick={() => changeLanguage("en")}
        className={`px-3 py-1 rounded text-sm border ${i18n.language === "en" ? "bg-blue-500 text-white" : "bg-white text-gray-700 border-gray-300"}`}
      >
        English
      </button>
    </div>
  );
}