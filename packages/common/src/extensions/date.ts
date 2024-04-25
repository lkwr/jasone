import type { Extension } from "@jasone/types";

export const dateExtension: Extension<Date, string> = {
  tag: 2,
  check: (value): value is Date => value instanceof Date,
  encode: (value) => value.toISOString(),
  decode: (value: string) => new Date(value),
};
