import type { Extension } from "@jasone/core";

export const regexpExtension: Extension<RegExp, [pattern: string, flags: string]> = {
  tag: 3,
  check: (value): value is RegExp => value instanceof RegExp,
  encode: (value) => [value.source, value.flags],
  decode: ([pattern, flags]) => new RegExp(pattern, flags),
};
