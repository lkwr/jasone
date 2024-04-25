import type { Extension, TaggedJson } from "@jasone/core";

export const setExtension: Extension<Set<unknown>, TaggedJson> = {
  tag: 4,
  check: (value): value is Set<unknown> => value instanceof Set,
  encode: (value, { instance }) => instance.encode(Array.from(value)),
  decode: (value, { instance }) => new Set(instance.decode<unknown[]>(value)),
};
