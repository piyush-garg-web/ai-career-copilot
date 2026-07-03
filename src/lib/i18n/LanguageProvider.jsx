"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", dir: "ltr" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", dir: "ltr" },
  { code: "es", name: "Spanish", nativeName: "Español", dir: "ltr" },
  { code: "fr", name: "French", nativeName: "Français", dir: "ltr" },
  { code: "de", name: "German", nativeName: "Deutsch", dir: "ltr" },
  { code: "pt", name: "Portuguese", nativeName: "Português", dir: "ltr" },
  { code: "it", name: "Italian", nativeName: "Italiano", dir: "ltr" },
  { code: "ja", name: "Japanese", nativeName: "日本語", dir: "ltr" },
  { code: "ko", name: "Korean", nativeName: "한국어", dir: "ltr" },
  { code: "zh", name: "Chinese (Simplified)", nativeName: "简体中文", dir: "ltr" },
  { code: "ar", name: "Arabic", nativeName: "العربية", dir: "rtl" },
  { code: "ru", name: "Russian", nativeName: "Русский", dir: "ltr" },
];

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const { user, isLoaded } = useUser();
  const [locale, setLocale] = useState("en");
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(true);

  // Initialize language from local storage, cookie, or DB
  useEffect(() => {
    // Check local storage or cookie
    let initialLang = "en";
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("pref_lang");
      if (savedLang && SUPPORTED_LANGUAGES.some(l => l.code === savedLang)) {
        initialLang = savedLang;
      } else {
        // Parse cookie
        const match = document.cookie.match(/(?:^|; )pref_lang=([^;]*)/);
        if (match && match[1] && SUPPORTED_LANGUAGES.some(l => l.code === match[1])) {
          initialLang = match[1];
        }
      }
    }
    setLocale(initialLang);
  }, []);

  // Fetch from DB if user logs in
  useEffect(() => {
    if (isLoaded && user) {
      const syncUserLang = async () => {
        try {
          const res = await fetch("/api/user");
          if (res.ok) {
            const userData = await res.json();
            const guestLang = localStorage.getItem("pref_lang");
            
            if (userData.preferredLanguage) {
              if (userData.preferredLanguage !== locale) {
                setLocale(userData.preferredLanguage);
              }
            } else if (guestLang && guestLang !== "en") {
              // Sync guest preference to DB
              await fetch("/api/user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ preferredLanguage: guestLang }),
              });
              setLocale(guestLang);
            }
          }
        } catch (e) {
          console.warn("[SYNC_USER_LANGUAGE_ERROR]:", e);
        }
      };
      syncUserLang();
    }
  }, [isLoaded, user]);

  // Load translations and set HTML attributes
  useEffect(() => {
    async function loadTranslations() {
      setLoading(true);
      try {
        // English fallback is bundled dynamically or lazy loaded
        const enBundle = await import("./locales/en.json");
        
        if (locale === "en") {
          setTranslations(enBundle.default);
        } else {
          const targetBundle = await import(`./locales/${locale}.json`);
          // Deep-merge target locale namespaces with English namespaces to handle fallback
          const enData = enBundle.default;
          const targetData = targetBundle.default;
          const merged = { ...enData };
          
          for (const ns in targetData) {
            merged[ns] = { ...enData[ns], ...targetData[ns] };
          }
          setTranslations(merged);
        }
      } catch (err) {
        console.error("Failed to load translation bundle for", locale, err);
      } finally {
        setLoading(false);
      }
    }

    loadTranslations();

    // Set direction & document language code
    const langInfo = SUPPORTED_LANGUAGES.find(l => l.code === locale) || { dir: "ltr" };
    document.documentElement.lang = locale;
    document.documentElement.dir = langInfo.dir;

    // Save to cookies and local storage
    document.cookie = `pref_lang=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    localStorage.setItem("pref_lang", locale);
  }, [locale]);

  const changeLanguage = async (newLocale) => {
    if (!SUPPORTED_LANGUAGES.some(l => l.code === newLocale)) return;
    setLocale(newLocale);

    if (isLoaded && user) {
      try {
        await fetch("/api/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ preferredLanguage: newLocale }),
        });
      } catch (e) {
        console.warn("[SAVE_USER_LANGUAGE_ERROR]:", e);
      }
    }
  };

  const t = (path) => {
    if (!path) return "";
    const parts = path.split(".");
    let val = translations;
    for (const part of parts) {
      if (val === undefined || val === null) return path;
      val = val[part];
    }
    return val !== undefined ? val : path;
  };

  return (
    <LanguageContext.Provider value={{ locale, t, changeLanguage, loading }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
