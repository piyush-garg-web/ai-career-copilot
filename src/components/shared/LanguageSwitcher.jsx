"use client";

import React, { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check, Search, Lock } from "lucide-react";
import { useTranslation, SUPPORTED_LANGUAGES } from "@/lib/i18n/LanguageProvider";
import { PremiumRequiredModal } from "@/components/shared/PremiumRequiredModal";
import { PremiumBadge } from "@/components/shared/PremiumBadge";
import { usePremium } from "@/hooks/use-premium";

export default function LanguageSwitcher({ isLandingPage = false }) {
  const { locale, changeLanguage, t } = useTranslation();
  const { isPremium, loading } = usePremium();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const dropdownRef = useRef(null);

  const activeLang = SUPPORTED_LANGUAGES.find((l) => l.code === locale) || SUPPORTED_LANGUAGES[0];

  // On landing page, language switching is free for everyone
  const isFreeMode = isLandingPage;

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLanguageChange = (langCode) => {
    // On landing page, allow all languages for everyone
    if (isFreeMode) {
      changeLanguage(langCode);
      setIsOpen(false);
      setSearchQuery("");
      return;
    }

    // In authenticated app, allow all languages for premium users, only English for free users
    if (!loading && !isPremium && langCode !== "en") {
      setIsOpen(false);
      setShowPremiumModal(true);
      return;
    }

    changeLanguage(langCode);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handlePremiumBadgeClick = (e) => {
    e.stopPropagation();
    setShowPremiumModal(true);
  };

  return (
    <>
      <div className="relative inline-block text-left" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/40 bg-card/40 hover:bg-accent/40 text-xs font-bold text-foreground transition-all duration-200 focus:outline-none select-none cursor-pointer"
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>{activeLang.nativeName}</span>
          {!isFreeMode && !isPremium && !loading && (
            <span onClick={handlePremiumBadgeClick} className="cursor-pointer">
              <PremiumBadge size="sm" />
            </span>
          )}
          <ChevronDown className={`w-3 h-3 text-muted-foreground shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <div 
            className="absolute right-0 mt-1.5 w-56 rounded-2xl border border-border/40 bg-card/90 backdrop-blur-md shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-200 focus:outline-none"
            role="menu"
          >
            {/* Search box */}
            <div className="relative mb-1.5">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("common.searchLanguage")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.value)}
                className="w-full h-8 pl-8 pr-3 text-[10px] rounded-xl border border-border/40 bg-background text-foreground font-semibold focus:outline-none focus:border-indigo-500"
                autoFocus
              />
            </div>

            <div className="max-h-56 overflow-y-auto scrollbar-hide space-y-0.5">
              {filteredLanguages.length > 0 ? (
                filteredLanguages.map((lang) => {
                  const isSelected = lang.code === locale;
                  const isLocked = !isFreeMode && !isPremium && !loading && lang.code !== "en";
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleLanguageChange(lang.code)}
                      role="menuitem"
                      className={`w-full h-8 px-2.5 rounded-xl flex items-center justify-between text-left text-xs font-bold transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-indigo-600 text-white"
                          : isLocked
                          ? "text-muted-foreground opacity-60 cursor-not-allowed"
                          : "text-foreground hover:bg-accent/40"
                      }`}
                      disabled={isLocked}
                    >
                      <div className="flex flex-col">
                        <span>{lang.nativeName}</span>
                        {!isSelected && (
                          <span className="text-[8px] text-muted-foreground font-medium -mt-0.5">
                            {lang.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {isLocked && <Lock className="w-3 h-3 text-muted-foreground shrink-0" />}
                        {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="py-2 text-center text-[10px] text-muted-foreground font-semibold">
                  {t("common.noLanguagesFound")}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <PremiumRequiredModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        featureName="🌍 Multilingual AI Experience"
      />
    </>
  );
}
