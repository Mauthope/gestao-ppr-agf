"use client";

import React, { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <div className="w-11 h-11 rounded-full border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
      className="min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-cyan-300 hover:border-cyan-500 transition-all cursor-pointer shadow-sm"
      title={isDark ? "Alternar para Porcelana (Claro)" : "Alternar para Obsidian (Escuro)"}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
