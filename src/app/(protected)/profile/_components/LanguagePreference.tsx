"use client";

import { updateLocale } from "@/actions/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isLocale, LOCALE_LABELS, LOCALES, type Locale } from "@/i18n/config";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

export function LanguagePreference({ locale }: { locale: Locale }) {
  const t = useTranslations("profile");
  const router = useRouter();
  const [value, setValue] = useState(locale);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setValue(locale);
  }, [locale]);

  function onValueChange(next: string) {
    if (!isLocale(next) || next === value) return;
    const previous = value;
    setValue(next);
    startTransition(async () => {
      try {
        const result = await updateLocale(next);
        if (!result.ok) {
          setValue(previous);
          toast.error(t("languageError"));
          return;
        }
        toast.success(result.message);
        router.refresh();
      } catch {
        setValue(previous);
        toast.error(t("languageError"));
      }
    });
  }

  return (
    <Card className="mb-6 max-w-md">
      <CardHeader>
        <CardTitle>{t("languageTitle")}</CardTitle>
        <CardDescription>{t("languageDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Select value={value} onValueChange={onValueChange} disabled={isPending}>
          <SelectTrigger className="w-full" aria-label={t("languageLabel")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LOCALES.map((code) => (
              <SelectItem key={code} value={code}>
                {LOCALE_LABELS[code]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
