export const LOCALES = ["en", "nb", "sv", "da"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_COOKIE = "NEXT_LOCALE";

export const LOCALE_MAX_AGE = 60 * 60 * 24 * 365;

export const localeCookieOptions = {
  maxAge: LOCALE_MAX_AGE,
  path: "/",
  sameSite: "lax" as const,
  httpOnly: true,
};

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  nb: "Norsk",
  sv: "Svenska",
  da: "Dansk",
};

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" &&
    (LOCALES as readonly string[]).includes(value)
  );
}

export function dateLocale(locale: string): string {
  return locale === "en" ? "en-US" : locale;
}
