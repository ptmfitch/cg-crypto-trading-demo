import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { isLocale, LOCALE_COOKIE, type Locale } from "./config";
import { loadMessages } from "./messages";

async function resolveLocale(): Promise<Locale> {
  const session = await auth();
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { locale: true },
    });
    if (user) {
      return isLocale(user.locale) ? user.locale : "en";
    }
  }

  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  return isLocale(cookieLocale) ? cookieLocale : "en";
}

export default getRequestConfig(async () => {
  const locale = await resolveLocale();
  return {
    locale,
    messages: loadMessages(locale),
  };
});
