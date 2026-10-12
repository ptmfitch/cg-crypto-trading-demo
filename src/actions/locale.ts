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

  await writeLocaleCookie(isLocale(user.locale) ? user.locale : "en");
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
    return { ok: true as const };
  } catch {
    return { ok: false as const };
  }
}
