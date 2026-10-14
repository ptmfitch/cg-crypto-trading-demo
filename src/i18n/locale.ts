export const locales = ["en", "sv", "da", "nb"] as const;

export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "en";

export const LOCALE_COOKIE = "NEXT_LOCALE";

/** One year. A session cookie would drop the language when the browser closes. */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLocale(value: string | undefined | null): value is AppLocale {
  return value != null && (locales as readonly string[]).includes(value);
}

export function resolveLocale(value: string | undefined | null): AppLocale {
  return isLocale(value) ? value : defaultLocale;
}

export function dateLocale(locale: string): string {
  return locale === "en" ? "en-US" : locale;
}
