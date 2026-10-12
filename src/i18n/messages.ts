import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type Catalog = {
  [key: string]: string | Catalog;
};

const MESSAGE_LOCALES = new Set(["en", "nb", "sv", "da"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCatalog(value: unknown): value is Catalog {
  if (!isRecord(value)) return false;
  return Object.values(value).every(
    (entry) => typeof entry === "string" || isCatalog(entry)
  );
}

function messagesDirectory(): string {
  const fromModule = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../messages"
  );
  if (existsSync(path.join(fromModule, "en.json"))) return fromModule;
  return path.join(process.cwd(), "messages");
}

function readCatalog(filename: string): Catalog | null {
  const filePath = path.join(messagesDirectory(), filename);
  if (!existsSync(filePath)) return null;
  try {
    const parsed: unknown = JSON.parse(readFileSync(filePath, "utf8"));
    return isCatalog(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function loadEnglish(): Catalog {
  const english = readCatalog("en.json");
  if (!english) {
    throw new Error("English message catalog is missing.");
  }
  return english;
}

function mergeCatalog(base: Catalog, override: Catalog): Catalog {
  const merged: Catalog = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const current = merged[key];
    if (isCatalog(current) && isCatalog(value)) {
      merged[key] = mergeCatalog(current, value);
    } else {
      merged[key] = value;
    }
  }
  return merged;
}

export function loadMessages(locale: string): Catalog {
  const english = loadEnglish();
  if (locale === "en" || !MESSAGE_LOCALES.has(locale)) {
    return english;
  }
  const translated = readCatalog(`${locale}.json`);
  if (!translated) return english;
  return mergeCatalog(english, translated);
}
