import type { Extension } from "@jasone/core";

export const undefinedExtension: Extension<undefined, null> = {
  tag: 0,
  check: (value): value is undefined => value === undefined,
  encode: () => null,
  decode: () => undefined,
};
