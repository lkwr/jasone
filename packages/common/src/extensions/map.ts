import { Extension, TaggedJson } from "@jasone/core";

export const mapExtension: Extension<Map<unknown, unknown>, TaggedJson> = {
  tag: 5,
  check: (value): value is Map<unknown, unknown> => value instanceof Map,
  encode: (value, { instance }) => instance.encode(Array.from(value.entries())),
  decode: (value, { instance }) => new Map(instance.decode<[unknown, unknown][]>(value)),
};
