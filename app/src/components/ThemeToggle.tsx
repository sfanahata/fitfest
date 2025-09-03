"use client";

import { useTheme } from "./ThemeProvider";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-fitfest-light dark:bg-fitfest-dark border border-fitfest-subtle/20 dark:border-fitfest-subtle/10 hover:bg-fitfest-subtle/10 dark:hover:bg-fitfest-subtle/20 transition-all duration-200"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <MoonIcon className="w-5 h-5 text-fitfest-text dark:text-fitfest-subtle" />
      ) : (
        <SunIcon className="w-5 h-5 text-fitfest-subtle dark:text-fitfest-gold" />
      )}
    </button>
  );
}
