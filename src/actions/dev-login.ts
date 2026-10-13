"use server";

import { setLocaleCookie } from "@/actions/locale";
import { signIn } from "@/auth";
import { isLocale } from "@/i18n/config";
import { isDevLoginEnabled } from "@/lib/dev-login";
import prisma from "@/lib/prisma";
import { AuthError } from "next-auth";
import { getTranslations } from "next-intl/server";

export async function signInAsTestAccount(email: string) {
  const t = await getTranslations("devLogin");
  if (!isDevLoginEnabled()) {
    return { error: t("turnedOff") };
  }

  const account = await prisma.user.findUnique({
    where: { email },
    select: { email: true, locale: true },
  });
  if (!account) {
    return { error: t("missingAccount") };
  }

  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    return { error: t("missingSecret") };
  }

  await setLocaleCookie(isLocale(account.locale) ? account.locale : "en");

  try {
    await signIn("credentials", {
      email: account.email,
      devLoginToken: secret,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: t("failed") };
    }
    throw error;
  }
}
