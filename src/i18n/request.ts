import { loadMessages } from "@/i18n/load-messages";
import { LOCALE_COOKIE, resolveLocale } from "@/i18n/locale";
import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

// Cookie only. A missing or unknown NEXT_LOCALE stays on English, including
// when the browser sends a Nordic Accept-Language.
export default getRequestConfig(async () => {
  const store = await cookies();
  const locale = resolveLocale(store.get(LOCALE_COOKIE)?.value);
  return {
    locale,
    messages: await loadMessages(locale),
  };
});
