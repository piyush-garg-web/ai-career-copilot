"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const AccentContext = createContext({
  accentColor: "Purple",
  setAccentColor: () => {}
});

export const useAccent = () => useContext(AccentContext);

const colorMap = {
  Purple: { color500: "#8b5cf6", color600: "#7c3aed" },
  Blue: { color500: "#3b82f6", color600: "#2563eb" },
  Green: { color500: "#10b981", color600: "#059669" },
  Orange: { color500: "#f97316", color600: "#ea580c" },
  Red: { color500: "#ef4444", color600: "#dc2626" },
  Pink: { color500: "#ec4899", color600: "#db2777" }
};

export default function AccentColorProvider({ children }) {
  const [accentColor, setAccentState] = useState("Purple");

  const setAccentColor = (color) => {
    if (colorMap[color]) {
      setAccentState(color);
      localStorage.setItem("user_selected_accent_color", color);
      applyAccentStyle(color);
    }
  };

  const applyAccentStyle = (color) => {
    const config = colorMap[color];
    if (!config) return;

    // Create or locate the custom stylesheet override tag
    let styleTag = document.getElementById("dynamic-accent-theme");
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = "dynamic-accent-theme";
      document.head.appendChild(styleTag);
    }

    const { color500, color600 } = config;

    // Build color overriding classes matching Tailwind's branding defaults (indigo, blue)
    styleTag.innerHTML = `
      /* Text Overrides */
      .text-indigo-400, .text-indigo-500, .text-indigo-600,
      .text-blue-400, .text-blue-500, .text-blue-600,
      .hover\\:text-indigo-500:hover, .hover\\:text-indigo-600:hover,
      .hover\\:text-blue-500:hover, .hover\\:text-blue-600:hover {
        color: ${color500} !important;
      }
      
      /* Background Overrides */
      .bg-indigo-500, .bg-indigo-600, .bg-indigo-700,
      .bg-blue-500, .bg-blue-600, .bg-blue-700,
      .hover\\:bg-indigo-600:hover, .hover\\:bg-indigo-700:hover,
      .hover\\:bg-blue-600:hover, .hover\\:bg-blue-700:hover {
        background-color: ${color600} !important;
      }
      
      /* Background alpha overrides */
      .bg-indigo-500\\/10, .bg-indigo-600\\/10, .bg-blue-500\\/10, .bg-blue-600\\/10 {
        background-color: ${color500}1a !important;
      }
      .bg-indigo-500\\/20, .bg-indigo-600\\/20, .bg-blue-500\\/20, .bg-blue-600\\/20 {
        background-color: ${color500}33 !important;
      }
      
      /* Border Overrides */
      .border-indigo-500, .border-indigo-600,
      .border-blue-500, .border-blue-600,
      .hover\\:border-indigo-500:hover, .hover\\:border-blue-500:hover {
        border-color: ${color500} !important;
      }
      .border-indigo-500\\/20, .border-indigo-600\\/20, .border-blue-500\\/20, .border-blue-600\\/20 {
        border-color: ${color500}33 !important;
      }
      .border-indigo-500\\/30, .border-indigo-600\\/30, .border-blue-500\\/30, .border-blue-600\\/30 {
        border-color: ${color500}4d !important;
      }
      
      /* Gradient Stops Overrides */
      .from-indigo-500, .from-indigo-600, .from-blue-500, .from-blue-600 {
        --tw-gradient-from: ${color600} !important;
        --tw-gradient-to: ${color600}00 !important;
        --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
      }
      .to-indigo-500, .to-indigo-600, .to-blue-500, .to-blue-600 {
        --tw-gradient-to: ${color600} !important;
      }
      .via-indigo-500, .via-indigo-600, .via-blue-500, .via-blue-600 {
        --tw-gradient-to: ${color600}00 !important;
        --tw-gradient-stops: var(--tw-gradient-from), ${color600} !important, var(--tw-gradient-to) !important;
      }
      
      /* Ring & Outline Overrides */
      .ring-indigo-500, .ring-blue-500 {
        --tw-ring-color: ${color500} !important;
      }
      .focus\\:border-indigo-500:focus, .focus\\:border-blue-500:focus {
        border-color: ${color500} !important;
      }
      .focus-within\\:border-indigo-500:focus-within, .focus-within\\:border-blue-500:focus-within {
        border-color: ${color500} !important;
      }
      
      /* UI Component Overrides (Progress rings, custom dividers) */
      .[\\&\\>div]\\:bg-indigo-500 > div, .[\\&\\>div]\\:bg-blue-500 > div {
        background-color: ${color500} !important;
      }
    `;
  };

  const applyAccessibilitySettings = (accessibility = {}) => {
    const doc = document.documentElement;
    
    // 1. Compact Mode Layout
    if (accessibility.compactMode) {
      doc.classList.add("compact-mode");
      let styleTag = document.getElementById("compact-mode-styles");
      if (!styleTag) {
        styleTag = document.createElement("style");
        styleTag.id = "compact-mode-styles";
        styleTag.innerHTML = `
          .compact-mode {
            --radius: 6px !important;
          }
          .compact-mode .p-6, .compact-mode .p-8 { padding: 1rem !important; }
          .compact-mode .p-4 { padding: 0.75rem !important; }
          .compact-mode .py-32 { padding-top: 3rem !important; padding-bottom: 3rem !important; }
          .compact-mode .gap-6 { gap: 1rem !important; }
          .compact-mode .gap-4 { gap: 0.75rem !important; }
          .compact-mode .space-y-6 > * + * { margin-top: 1rem !important; }
          .compact-mode .space-y-4 > * + * { margin-top: 0.75rem !important; }
        `;
        document.head.appendChild(styleTag);
      }
    } else {
      doc.classList.remove("compact-mode");
    }

    // 2. High Contrast Theme Alignment
    if (accessibility.highContrast) {
      doc.classList.add("high-contrast");
      let styleTag = document.getElementById("high-contrast-styles");
      if (!styleTag) {
        styleTag = document.createElement("style");
        styleTag.id = "high-contrast-styles";
        styleTag.innerHTML = `
          .high-contrast {
            --foreground: 0 0% 100% !important;
            --muted-foreground: 0 0% 95% !important;
            --border: 0 0% 100% !important;
            --card: 0 0% 0% !important;
          }
          .high-contrast * {
            border-color: rgba(255,255,255,0.85) !important;
            text-shadow: 0 0 1px rgba(255,255,255,0.1) !important;
          }
        `;
        document.head.appendChild(styleTag);
      }
    } else {
      doc.classList.remove("high-contrast");
    }

    // 3. Reduce Motion
    if (accessibility.reduceMotion) {
      doc.classList.add("reduce-motion");
      let styleTag = document.getElementById("reduce-motion-styles");
      if (!styleTag) {
        styleTag = document.createElement("style");
        styleTag.id = "reduce-motion-styles";
        styleTag.innerHTML = `
          .reduce-motion, .reduce-motion * {
            animation-delay: -1ms !important;
            animation-duration: 1ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 1ms !important;
            transition-delay: -1ms !important;
            scroll-behavior: auto !important;
          }
        `;
        document.head.appendChild(styleTag);
      }
    } else {
      doc.classList.remove("reduce-motion");
    }

    // 4. Screen Reader Optimization
    if (accessibility.screenReader) {
      doc.classList.add("screen-reader-optimized");
    } else {
      doc.classList.remove("screen-reader-optimized");
    }
  };

  // Sync initial accent color state from database or localStorage
  useEffect(() => {
    const cachedColor = localStorage.getItem("user_selected_accent_color");
    if (cachedColor) {
      setAccentState(cachedColor);
      applyAccentStyle(cachedColor);
    }

    async function fetchUserAccent() {
      try {
        const res = await fetch("/api/user");
        if (res.ok) {
          const userData = await res.json();
          if (userData.appearanceSettings?.accentColor) {
            const serverColor = userData.appearanceSettings.accentColor;
            setAccentState(serverColor);
            localStorage.setItem("user_selected_accent_color", serverColor);
            applyAccentStyle(serverColor);
          }
          if (userData.accessibilitySettings) {
            applyAccessibilitySettings(userData.accessibilitySettings);
          }
        }
      } catch (err) {
        console.error("Failed to retrieve visual accent styles:", err);
      }
    }
    fetchUserAccent();
  }, []);

  useEffect(() => {
    const handleAccessChange = (e) => {
      applyAccessibilitySettings(e.detail || {});
    };
    window.addEventListener("accessibility-changed", handleAccessChange);
    return () => window.removeEventListener("accessibility-changed", handleAccessChange);
  }, []);

  return (
    <AccentContext.Provider value={{ accentColor, setAccentColor }}>
      {children}
    </AccentContext.Provider>
  );
}
