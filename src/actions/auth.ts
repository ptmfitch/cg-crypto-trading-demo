"use server";

import { isLocale, LOCALE_COOKIE } from "@/i18n/config";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { z } from "zod";

type RegisterValues = {
  name: string;
  email: string;
  password: string;
};

export async function registerUser(values: RegisterValues) {
  const t = await getTranslations("register");
  const RegisterSchema = z.object({
    name: z.string().min(2, t("nameMinServer")),
    email: z.string().email(t("invalidEmail")),
    password: z.string().min(6, t("passwordMinServer")),
  });
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: t("invalidFields") };
  }

  const { name, email, password } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);
  const cookieStore = await cookies();
  const preferred = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(preferred) ? preferred : "en";

  try {
    await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          hashedPassword,
          locale,
        },
      });

      await tx.wallet.create({
        data: {
          userId: newUser.id,
        },
      });
    });

    return { success: t("successServer") };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return { error: t("emailTaken") };
      }
    }
    return { error: t("genericError") };
  }
}
