import type { Extension } from "@jasone/core";

export const bigintExtension: Extension<bigint, string> = {
  tag: 1,
  check: (value): value is bigint => typeof value === "bigint",
  encode: (value) => value.toString(),
  decode: (value: string) => BigInt(value),
};
