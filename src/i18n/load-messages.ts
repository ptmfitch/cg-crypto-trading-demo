import type { AppLocale } from "@/i18n/locale";

export async function loadMessages(locale: AppLocale) {
  switch (locale) {
    case "sv":
      return (await import("../../messages/sv.json")).default;
    case "da":
      return (await import("../../messages/da.json")).default;
    case "nb":
      return (await import("../../messages/nb.json")).default;
    case "en":
      return (await import("../../messages/en.json")).default;
    default: {
      const exhaustive: never = locale;
      return exhaustive;
    }
  }
}
