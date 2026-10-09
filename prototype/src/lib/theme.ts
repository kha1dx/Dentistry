import { useEffect, useState } from "react";

export type ThemePref = "system" | "light" | "dark";

const KEY = "cusp-theme";

function read(): ThemePref {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    /* storage unavailable */
  }
  return "system";
}

function apply(p: ThemePref) {
  const root = document.documentElement;
  if (p === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", p);
}

export function useTheme() {
  const [pref, setPref] = useState<ThemePref>(() => {
    // respect a theme the host page already set
    const host = document.documentElement.getAttribute("data-theme");
    return host === "light" || host === "dark" ? host : read();
  });
  useEffect(() => {
    apply(pref);
    try {
      localStorage.setItem(KEY, pref);
    } catch {
      /* ignore */
    }
  }, [pref]);
  const isDark =
    pref === "dark" || (pref === "system" && typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches);
  const cycle = () => setPref((p) => (p === "system" ? (isDark ? "light" : "dark") : p === "dark" ? "light" : "dark"));
  return { pref, isDark, cycle, setPref };
}
