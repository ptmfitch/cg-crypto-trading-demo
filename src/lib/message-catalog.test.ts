import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

function readCatalog(locale: string) {
  return JSON.parse(readFileSync(join(root, "messages", `${locale}.json`), "utf8"));
}

function leafPaths(value: unknown, prefix = ""): string[] {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return Object.entries(value).flatMap(([key, child]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      return leafPaths(child, path);
    });
  }
  return [prefix];
}

function leafValue(catalog: unknown, path: string): string {
  const value = path.split(".").reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[key];
  }, catalog);
  assert.equal(typeof value, "string", path);
  return value as string;
}

function placeholders(value: string): string[] {
  return [...value.matchAll(/\{[a-zA-Z]+\}/g)].map((match) => match[0]).sort();
}

const locales = ["en", "sv", "da", "nb"];

describe("message catalogs", () => {
  const catalogs = Object.fromEntries(
    locales.map((locale) => [locale, readCatalog(locale)])
  );
  const englishPaths = leafPaths(catalogs.en);

  it("keeps the English strings the demo flow looks for", () => {
    assert.equal(leafValue(catalogs.en, "landing.title"), "Welcome to TradeSim");
    assert.equal(leafValue(catalogs.en, "landing.login"), "Login");
    assert.equal(leafValue(catalogs.en, "landing.createAccount"), "Create Account");
    assert.equal(leafValue(catalogs.en, "login.title"), "Welcome Back");
    assert.equal(leafValue(catalogs.en, "login.submit"), "Login");
    assert.equal(leafValue(catalogs.en, "login.testAccount"), "Test account");
    assert.equal(
      leafValue(catalogs.en, "login.continueAsAccount"),
      "Continue as this account"
    );
    assert.equal(leafValue(catalogs.en, "register.title"), "Create an Account");
    assert.equal(leafValue(catalogs.en, "register.submit"), "Create Account");
    assert.equal(leafValue(catalogs.en, "header.dashboard"), "Dashboard");
    assert.equal(leafValue(catalogs.en, "header.profile"), "Profile");
    assert.equal(leafValue(catalogs.en, "header.logout"), "Logout");
    assert.equal(leafValue(catalogs.en, "dashboard.portfolioValue"), "Portfolio Value");
    assert.equal(leafValue(catalogs.en, "dashboard.totalPnl"), "Total P&L");
    assert.equal(leafValue(catalogs.en, "dashboard.liveBtcPrice"), "Live BTC Price");
    assert.equal(leafValue(catalogs.en, "dashboard.totalTrades"), "Total Trades");
    assert.equal(leafValue(catalogs.en, "trade.buy"), "Buy");
    assert.equal(leafValue(catalogs.en, "trade.sell"), "Sell");
    assert.equal(leafValue(catalogs.en, "trade.youPay"), "You Pay");
    assert.equal(leafValue(catalogs.en, "trade.submitBuy"), "BUY BTC");
    assert.equal(leafValue(catalogs.en, "trade.submitSell"), "SELL BTC");
    assert.equal(leafValue(catalogs.en, "profile.title"), "Performance Report");
    assert.equal(leafValue(catalogs.en, "profile.history"), "Trade History");
    assert.equal(leafValue(catalogs.en, "metadata.title"), "Crypto Trading Simulator");
  });

  it("gives Swedish, Danish, and Norwegian the English key tree and placeholders", () => {
    for (const locale of locales) {
      assert.deepEqual(leafPaths(catalogs[locale]), englishPaths);
      for (const path of englishPaths) {
        assert.deepEqual(
          placeholders(leafValue(catalogs[locale], path)),
          placeholders(leafValue(catalogs.en, path)),
          `${locale} ${path}`
        );
      }
    }
  });
});
