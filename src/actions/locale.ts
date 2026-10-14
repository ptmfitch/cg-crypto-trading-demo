"use server";

import {
  isLocale,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
} from "@/i18n/locale";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function setLocale(locale: string) {
  if (!isLocale(locale)) return;

  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}
