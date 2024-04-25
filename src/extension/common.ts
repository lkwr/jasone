import { Extension } from "./extension.ts";
import { Tagged } from "../types.ts";

export const undefinedExtension: Extension<undefined, null> = {
  tag: 0,
  check: (value): value is undefined => value === undefined,
  encode: () => null,
  decode: () => undefined,
};

export const dateExtension: Extension<Date, string> = {
  tag: 1,
  check: (value): value is Date => value instanceof Date,
  encode: (value) => value.toISOString(),
  decode: (value: string) => new Date(value),
};

export const setExtension: Extension<Set<unknown>, Tagged> = {
  tag: 2,
  check: (value): value is Set<unknown> => value instanceof Set,
  encode: (value, { instance }) => instance.encode(Array.from(value)),
  decode: (value, { instance }) => new Set(instance.decode<unknown[]>(value)),
};

export const mapExtension: Extension<Map<unknown, unknown>, Tagged> = {
  tag: 3,
  check: (value): value is Map<unknown, unknown> => value instanceof Map,
  encode: (value, { instance }) => instance.encode(Array.from(value.entries())),
  decode: (value, { instance }) => new Map(instance.decode<[unknown, unknown][]>(value)),
};
