// @vitest-environment node

import { describe, expect, it } from "vitest";
import { isAccessTokenExpired } from "./session";

describe("isAccessTokenExpired", () => {
  it.each([
    { name: "before expiration", expiration: 1_001, now: 1_000_999, expired: false },
    { name: "at expiration", expiration: 1_001, now: 1_001_000, expired: true },
    { name: "after expiration", expiration: 1_001, now: 1_001_001, expired: true },
  ])("returns $expired $name", ({ expiration, now, expired }) => {
    const token = tokenWithPayload({ exp: expiration });

    expect(isAccessTokenExpired(token, now)).toBe(expired);
  });

  it("rejects a malformed token without a payload", () => {
    expect(isAccessTokenExpired("not-a-token", 0)).toBe(true);
  });

  it("rejects a token whose payload omits expiration", () => {
    expect(isAccessTokenExpired(tokenWithPayload({}), 0)).toBe(true);
  });
});

function tokenWithPayload(payload: object): string {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `header.${encoded}.signature`;
}
