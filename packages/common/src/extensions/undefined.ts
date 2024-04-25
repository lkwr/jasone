import type { Extension } from "@jasone/types";

export const undefinedExtension: Extension<undefined, null> = {
  tag: 0,
  check: (value): value is undefined => value === undefined,
  encode: () => null,
  decode: () => undefined,
};
