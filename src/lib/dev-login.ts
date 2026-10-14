import { getTranslations } from "next-intl/server";
import prisma from "./prisma";

export type TestAccount = {
  email: string;
  name: string;
  summary: string;
};

export function isDevLoginEnabled() {
  return (
    process.env.NODE_ENV === "development" && process.env.DEV_LOGIN === "true"
  );
}

function formatUsd(value: { toString(): string } | null | undefined) {
  const amount = Number(value?.toString() ?? "0");
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatBtc(value: { toString(): string } | null | undefined) {
  const amount = Number(value?.toString() ?? "0");
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  }).format(amount);
}

export async function listTestAccounts(): Promise<TestAccount[]> {
  if (!isDevLoginEnabled()) {
    return [];
  }

  const users = await prisma.user.findMany({
    take: 50,
    orderBy: [{ name: "asc" }, { email: "asc" }],
    select: {
      email: true,
      name: true,
      wallet: { select: { usdtBalance: true, btcBalance: true } },
      _count: { select: { trades: true } },
    },
  });

  const t = await getTranslations("devLogin");

  return users.map((user) => {
    const count = user._count.trades;
    const trades = count === 1 ? t("oneTrade") : t("manyTrades", { count });
    return {
      email: user.email,
      name: user.name?.trim() || t("unnamed"),
      summary: t("cashSummary", {
        cash: formatUsd(user.wallet?.usdtBalance),
        btc: formatBtc(user.wallet?.btcBalance),
        trades,
      }),
    };
  });
}
