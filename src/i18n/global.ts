import type { AppLocale } from "@/i18n/locale";

declare module "use-intl" {
  interface AppConfig {
    Locale: AppLocale;
    Messages: typeof import("../../messages/en.json");
  }
}

export {};
