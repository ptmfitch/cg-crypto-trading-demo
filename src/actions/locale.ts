"use server";

import { auth } from "@/auth";
import {
  isLocale,
  LOCALE_COOKIE,
  localeCookieOptions,
  type Locale,
} from "@/i18n/config";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";

async function writeLocaleCookie(locale: Locale) {
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, localeCookieOptions);
}

export async function setLocaleCookie(locale: string) {
  if (!isLocale(locale)) return;
  await writeLocaleCookie(locale);
}

export async function syncLocaleCookie() {
  const session = await auth();
  if (!session?.user?.id) return;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { locale: true },
  });
  if (!user) return;

  const locale = isLocale(user.locale) ? user.locale : "en";
  const cookieStore = await cookies();
  if (cookieStore.get(LOCALE_COOKIE)?.value === locale) return;

  await writeLocaleCookie(locale);
}

export async function updateLocale(locale: string) {
  if (!isLocale(locale)) return { ok: false as const };

  const session = await auth();
  if (!session?.user?.id) return { ok: false as const };

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { locale },
    });
    await writeLocaleCookie(locale);
    revalidatePath("/", "layout");
    // Read after the user row is updated so the confirmation uses the new locale.
    const t = await getTranslations("profile");
    return { ok: true as const, message: t("languageSaved") };
  } catch {
    return { ok: false as const };
  }
}
