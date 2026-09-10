"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  resolvedTheme: "dark",
  setTheme: async () => {},
  isLoading: true,
});

const API_URL = "https://ink-backend.vercel.app";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");
  const [isLoading, setIsLoading] = useState(true);

  // ============================================
  // APPLIQUER LE THÈME AU DOM
  // ============================================
  const applyThemeToDOM = (themeToApply: Theme) => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    let effectiveTheme: "light" | "dark";

    if (themeToApply === "system") {
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      effectiveTheme = systemPrefersDark ? "dark" : "light";
    } else {
      effectiveTheme = themeToApply;
    }

    if (effectiveTheme === "light") {
      root.classList.add("light-theme");
    } else {
      root.classList.remove("light-theme");
    }

    setResolvedTheme(effectiveTheme);
  };

  // ============================================
  // CHARGER LE THÈME DEPUIS LE BACKEND
  // ============================================
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const token = localStorage.getItem("token");

        // 1. Appliquer un thème par défaut depuis localStorage (rapide, évite le flash)
        const cachedTheme = localStorage.getItem("theme") as Theme | null;
        if (cachedTheme) {
          setThemeState(cachedTheme);
          applyThemeToDOM(cachedTheme);
        }

        // 2. Si connecté, charger le thème depuis le backend
        if (token) {
          const res = await fetch(`${API_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            const data = await res.json();
            const userTheme = (data.preferences?.theme || data.theme || "dark") as Theme;

            setThemeState(userTheme);
            applyThemeToDOM(userTheme);
            localStorage.setItem("theme", userTheme);
          }
        }
      } catch (err) {
        console.error("Erreur chargement thème:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  // ============================================
  // ÉCOUTER LE CHANGEMENT DE THÈME SYSTÈME
  // ============================================
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyThemeToDOM("system");

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // ============================================
  // CHANGER LE THÈME (API publique)
  // ============================================
  const setTheme = async (newTheme: Theme) => {
    // 1. Appliquer immédiatement (UX rapide)
    setThemeState(newTheme);
    applyThemeToDOM(newTheme);
    localStorage.setItem("theme", newTheme);

    // 2. Sauvegarder au backend si connecté
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await fetch(`${API_URL}/users/preferences`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ theme: newTheme }),
      });
    } catch (err) {
      console.error("Erreur sauvegarde thème:", err);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ============================================
// HOOK POUR UTILISER LE THÈME
// ============================================
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
