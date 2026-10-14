import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  defaultLocale,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  resolveLocale,
} from "../i18n/locale.ts";

describe("resolveLocale", () => {
  it("stays on English when the cookie is missing or unknown", () => {
    assert.equal(defaultLocale, "en");
    assert.equal(resolveLocale(undefined), "en");
    assert.equal(resolveLocale(null), "en");
    assert.equal(resolveLocale(""), "en");
    assert.equal(resolveLocale("fr"), "en");
    assert.equal(resolveLocale("EN"), "en");
    assert.equal(resolveLocale("no"), "en");
  });

  it("accepts Swedish, Danish, and Norwegian Bokmål", () => {
    assert.equal(resolveLocale("sv"), "sv");
    assert.equal(resolveLocale("da"), "da");
    assert.equal(resolveLocale("nb"), "nb");
  });

  it("names a year-long preference cookie", () => {
    assert.equal(LOCALE_COOKIE, "NEXT_LOCALE");
    assert.equal(LOCALE_COOKIE_MAX_AGE, 60 * 60 * 24 * 365);
  });
});
