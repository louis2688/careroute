"use client";

import { useSyncExternalStore } from "react";
import { Icon } from "./icons";

const KEY = "theme";
const isDark = () => document.documentElement.classList.contains("dark");
// Re-render whenever something (this button, another tab) changes the class on <html>.
const subscribe = (cb: () => void) => {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => mo.disconnect();
};

export function ThemeToggle({ labels }: { labels: { light: string; dark: string } }) {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);
  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(KEY, next ? "dark" : "light");
    } catch {}
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? labels.light : labels.dark}
      title={dark ? labels.light : labels.dark}
      className="inline-flex size-11 cursor-pointer items-center justify-center rounded-md text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
    >
      <Icon name={dark ? "sun" : "moon"} className="size-5" />
    </button>
  );
}

// Runs before first paint so a saved dark preference never flashes light. Inlined by the root layout.
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${KEY}");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}})();`;
