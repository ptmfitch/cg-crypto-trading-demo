import { auth } from "@/auth";
import { LocaleSync } from "@/components/LocaleSync";
import { Header } from "@/components/Header";
import { isLocale, LOCALE_COOKIE } from "@/i18n/config";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  let mismatch = false;
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { locale: true },
    });
    if (user) {
      const userLocale = isLocale(user.locale) ? user.locale : "en";
      const cookieStore = await cookies();
      mismatch = cookieStore.get(LOCALE_COOKIE)?.value !== userLocale;
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {mismatch ? <LocaleSync /> : null}
      <Header />
      <main className="flex-grow">{children}</main>
    </div>
  );
}
