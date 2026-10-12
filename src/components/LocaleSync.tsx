"use client";

import { syncLocaleCookie } from "@/actions/locale";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

let syncStarted = false;

export function LocaleSync() {
  const router = useRouter();

  useEffect(() => {
    if (syncStarted) return;
    syncStarted = true;
    void syncLocaleCookie().then(() => {
      router.refresh();
    });
  }, [router]);

  return null;
}
