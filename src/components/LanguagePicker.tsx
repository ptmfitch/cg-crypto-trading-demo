"use client";

import { setLocale } from "@/actions/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { locales } from "@/i18n/locale";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function LanguagePicker() {
  const t = useTranslations("language");
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="profile-language" className="text-sm font-medium">
        {t("label")}
      </label>
      <Select
        value={locale}
        disabled={pending}
        onValueChange={(value) => {
          startTransition(async () => {
            await setLocale(value);
            router.refresh();
          });
        }}
      >
        <SelectTrigger
          id="profile-language"
          aria-label={t("label")}
          className="w-[220px]"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {locales.map((code) => (
            <SelectItem key={code} value={code}>
              {t(code)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="max-w-[220px] text-xs text-muted-foreground">
        {t("description")}
      </p>
    </div>
  );
}
