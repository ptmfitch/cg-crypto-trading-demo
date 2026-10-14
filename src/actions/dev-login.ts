"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { isDevLoginEnabled } from "@/lib/dev-login";
import prisma from "@/lib/prisma";
import { getTranslations } from "next-intl/server";

export async function signInAsTestAccount(email: string) {
  const t = await getTranslations("devLogin");
  if (!isDevLoginEnabled()) {
    return { error: t("off") };
  }

  const account = await prisma.user.findUnique({
    where: { email },
    select: { email: true },
  });
  if (!account) {
    return { error: t("missingAccount") };
  }

  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    return { error: t("missingSecret") };
  }

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
