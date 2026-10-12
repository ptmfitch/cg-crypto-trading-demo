"use client";

import { syncLocaleCookie } from "@/actions/locale";
import { useEffect } from "react";

export function LocaleSync() {
  useEffect(() => {
    // Signed-in pages already render from User.locale. This copies that
    // value into the cookie so the next signed-out visit stays in sync.
    void syncLocaleCookie();
  }, []);

  return null;
}
