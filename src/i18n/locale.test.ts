import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { isLocale } from "./config.ts";
import { loadMessages } from "./messages.ts";

const messagesDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../messages"
);

const browserStrings = [
  "Welcome to TradeSim",
  "Create Account",
  "Create an Account",
  "Welcome Back",
  "Test account",
  "Continue as this account",
  "Welcome Back, {name}!",
  "Portfolio Value",
  "Total P&L",
  "Live BTC Price",
  "Total Trades",
  "Buy",
  "Sell",
  "You Pay",
  "BUY BTC",
  "SELL BTC",
  "Price delayed",
  "Price unavailable",
  "TradeSim",
  "Dashboard",
  "Profile",
  "Logout",
  "Performance Report",
  "Trade History",
  "Crypto Trading Simulator",
  "Could Not Load Dashboard",
];

function readJson(filename: string): unknown {
  return JSON.parse(readFileSync(path.join(messagesDir, filename), "utf8"));
}

function flattenValues(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") {
    out.push(value);
    return out;
  }
  if (value && typeof value === "object") {
    for (const entry of Object.values(value)) flattenValues(entry, out);
  }
  return out;
}

function flattenKeys(value: unknown, prefix = ""): string[] {
  if (typeof value === "string") return prefix ? [prefix] : [];
  if (!value || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([key, entry]) => {
    const next = prefix ? `${prefix}.${key}` : key;
    return flattenKeys(entry, next);
  });
}

function assertNoEmptyStrings(value: unknown) {
  if (typeof value === "string") {
    assert.notEqual(value, "");
    return;
  }
  if (value && typeof value === "object") {
    for (const entry of Object.values(value)) assertNoEmptyStrings(entry);
  }
}

describe("isLocale", () => {
  it("accepts en, nb, sv, and da", () => {
    for (const locale of ["en", "nb", "sv", "da"]) {
      assert.equal(isLocale(locale), true);
    }
  });

  it("rejects no, nn, sv-SE, and an empty string", () => {
    for (const locale of ["no", "nn", "sv-SE", ""]) {
      assert.equal(isLocale(locale), false);
    }
  });
});

describe("loadMessages", () => {
  const english = readJson("en.json");

  it("returns the English catalog for an unknown locale", () => {
    assert.deepEqual(loadMessages("fr"), english);
  });

  it("returns English when messages/nb.json is absent", () => {
    const nbPath = path.join(messagesDir, "nb.json");
    if (existsSync(nbPath)) return;
    assert.deepEqual(loadMessages("nb"), english);
  });

  it("keeps the English catalog available for the browser checks", () => {
    const values = flattenValues(english);
    for (const expected of browserStrings) {
      assert.ok(values.includes(expected), expected);
    }
    assert.deepEqual(loadMessages("en"), english);
  });

  for (const locale of ["nb", "sv", "da"]) {
    it(`checks ${locale}.json keys when that catalog exists`, () => {
      const filePath = path.join(messagesDir, `${locale}.json`);
      if (!existsSync(filePath)) return;
      const translated = readJson(`${locale}.json`);
      assert.deepEqual(flattenKeys(translated).sort(), flattenKeys(english).sort());
      assertNoEmptyStrings(translated);
    });
  }
});
