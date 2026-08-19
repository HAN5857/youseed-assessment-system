"use client";

import { useEffect, useState } from "react";
import { sound } from "@/lib/sounds";

export type MandarinLocale = "zh" | "en";

const STORAGE_KEY = "youseed_mandarin_locale";
const COOKIE_KEY = "youseed_mandarin_locale";
let memoryLocale: MandarinLocale | null = null;

function readLocale(): MandarinLocale {
  if (memoryLocale) return memoryLocale;
  if (typeof window === "undefined") return "zh";
  const urlLocale = new URL(window.location.href).searchParams.get("lang");
  if (urlLocale === "en" || urlLocale === "zh") {
    memoryLocale = urlLocale;
    window.localStorage.setItem(STORAGE_KEY, urlLocale);
    return urlLocale;
  }
  const stored = window.localStorage.getItem(STORAGE_KEY);
  memoryLocale = stored === "en" ? "en" : "zh";
  return memoryLocale;
}

export function setMandarinLocale(locale: MandarinLocale) {
  memoryLocale = locale;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, locale);
    document.cookie = `${COOKIE_KEY}=${locale}; path=/; max-age=31536000; samesite=lax`;
    const url = new URL(window.location.href);
    url.searchParams.set("lang", locale);
    window.history.replaceState(window.history.state, "", url);
    window.dispatchEvent(new CustomEvent("youseed:mandarin-locale", { detail: locale }));
  }
}

export function mandarinHref(path: string, locale: MandarinLocale) {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}lang=${locale}`;
}

export function useMandarinLocale() {
  const [locale, setLocaleState] = useState<MandarinLocale>("zh");

  useEffect(() => {
    setLocaleState(readLocale());
    const sync = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      memoryLocale = event.newValue === "en" ? "en" : "zh";
      setLocaleState(memoryLocale);
    };
    const syncCustom = (event: Event) => {
      const next = (event as CustomEvent<MandarinLocale>).detail;
      setLocaleState(next === "en" ? "en" : "zh");
    };
    window.addEventListener("storage", sync);
    window.addEventListener("youseed:mandarin-locale", syncCustom);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("youseed:mandarin-locale", syncCustom);
    };
  }, []);

  return {
    locale,
    isEnglish: locale === "en",
    setLocale: setMandarinLocale,
    text: <T,>(zh: T, en: T) => (locale === "en" ? en : zh),
  };
}

export function MandarinLanguageSwitch({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useMandarinLocale();

  function choose(next: MandarinLocale) {
    if (next === locale) return;
    sound().play("click");
    setLocale(next);
  }

  return (
    <div
      className={`mandarin-locale-switch ${className}`.trim()}
      role="group"
      aria-label={locale === "zh" ? "选择界面语言" : "Choose interface language"}
    >
      <button type="button" onClick={() => choose("en")} aria-pressed={locale === "en"}>
        EN
      </button>
      <button type="button" onClick={() => choose("zh")} aria-pressed={locale === "zh"}>
        中文
      </button>
    </div>
  );
}
