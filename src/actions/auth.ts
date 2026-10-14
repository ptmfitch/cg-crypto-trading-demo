"use server";

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getTranslations } from "next-intl/server";
import { z } from "zod";

export type RegisterValues = {
  name: string;
  email: string;
  password: string;
};

export async function registerUser(values: RegisterValues) {
  const t = await getTranslations("register");
  const RegisterSchema = z.object({
    name: z.string().min(2, t("nameMin")),
    email: z.string().email(t("invalidEmail")),
    password: z.string().min(6, t("passwordMin")),
  });
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: t("invalidFields") };
  }

  const { name, email, password } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          hashedPassword,
        },
      });

      await tx.wallet.create({
        data: {
          userId: newUser.id,
        },
      });
    });

    return { success: t("created") };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return { error: t("emailTaken") };
      }
    }
    return { error: t("genericError") };
  }
}
