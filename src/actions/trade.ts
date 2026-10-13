"use server";

import { auth } from "@/auth";
import { getBtcQuote } from "@/lib/btc-market";
import { assertTradableQuote, TRADE_PAUSED_ERROR } from "@/lib/btc-quote";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { z } from "zod";

const TradeSchema = z.object({
  amount: z.number().positive(),
  tradeType: z.enum(["BUY", "SELL"]),
  asset: z.enum(["USDT", "BTC"]),
});

function translateTradeError(
  code: string,
  t: Awaited<ReturnType<typeof getTranslations>>,
  quote: Awaited<ReturnType<typeof getTranslations>>
) {
  switch (code) {
    case "Not authenticated":
      return t("notAuthenticated");
    case "Invalid input":
      return t("invalidInput");
    case "Wallet not found.":
      return t("walletNotFound");
    case "Insufficient USDT balance.":
      return t("insufficientUsdt");
    case "Insufficient BTC balance.":
      return t("insufficientBtc");
    case TRADE_PAUSED_ERROR:
      return quote("tradingPaused");
    default:
      return t("failed");
  }
}

export async function executeTrade(values: z.infer<typeof TradeSchema>) {
  const t = await getTranslations("trade");
  const tQuote = await getTranslations("quote");
  const session = await auth();
  if (!session?.user?.id) {
    return { error: translateTradeError("Not authenticated", t, tQuote) };
  }
  const userId = session.user.id;

  const validatedFields = TradeSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: translateTradeError("Invalid input", t, tQuote) };
  }

  const { amount, tradeType, asset } = validatedFields.data;

  const tradable = assertTradableQuote(await getBtcQuote());
  if (!tradable.ok) {
    return { error: translateTradeError(tradable.error, t, tQuote) };
  }
  const liveBtcPrice = new Prisma.Decimal(tradable.usd);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) throw new Error("Wallet not found.");

      let usdtAmount: Prisma.Decimal;
      let btcAmount: Prisma.Decimal;

      if (asset === "USDT") {
        usdtAmount = new Prisma.Decimal(amount);
        btcAmount = usdtAmount.div(liveBtcPrice);
      } else {
        btcAmount = new Prisma.Decimal(amount);
        usdtAmount = btcAmount.mul(liveBtcPrice);
      }

      if (tradeType === "BUY") {
        if (wallet.usdtBalance.lt(usdtAmount))
          throw new Error("Insufficient USDT balance.");
        await tx.wallet.update({
          where: { userId },
          data: {
            usdtBalance: { decrement: usdtAmount },
            btcBalance: { increment: btcAmount },
          },
        });
      } else {
        if (wallet.btcBalance.lt(btcAmount))
          throw new Error("Insufficient BTC balance.");
        await tx.wallet.update({
          where: { userId },
          data: {
            usdtBalance: { increment: usdtAmount },
            btcBalance: { decrement: btcAmount },
          },
        });
      }

      await tx.trade.create({
        data: {
          userId,
          type: tradeType,
          usdtAmount: usdtAmount,
          btcAmount: btcAmount,
          priceAtTrade: liveBtcPrice,
        },
      });

      const btcDisplay = btcAmount.toDP(6);
      const usdtDisplay = usdtAmount.toDP(2);

      return {
        message: t("success", {
          action: tradeType === "BUY" ? t("bought") : t("sold"),
          btc: btcDisplay.toString(),
          usdt: usdtDisplay.toString(),
        }),
      };
    });

    revalidatePath("/dashboard");
    revalidatePath("/profile");
    return { success: result.message };
  } catch (error) {
    const code =
      error instanceof Error && error.message ? error.message : "Trade failed.";
    return { error: translateTradeError(code, t, tQuote) };
  }
}
