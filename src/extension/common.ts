import { Extension } from "./extension.ts";
import { Tagged } from "../types.ts";

export const undefinedExtension: Extension<undefined, null> = {
  tag: 0,
  check: (value): value is undefined => value === undefined,
  encode: () => null,
  decode: () => undefined,
};

export const bigintExtension: Extension<bigint, string> = {
  tag: 1,
  check: (value): value is bigint => typeof value === "bigint",
  encode: (value) => value.toString(),
  decode: (value: string) => BigInt(value),
};

export const dateExtension: Extension<Date, string> = {
  tag: 2,
  check: (value): value is Date => value instanceof Date,
  encode: (value) => value.toISOString(),
  decode: (value: string) => new Date(value),
};

export const regexpExtension: Extension<RegExp, [pattern: string, flags: string]> = {
  tag: 3,
  check: (value): value is RegExp => value instanceof RegExp,
  encode: (value) => [value.source, value.flags],
  decode: ([pattern, flags]) => new RegExp(pattern, flags),
};

export const setExtension: Extension<Set<unknown>, Tagged> = {
  tag: 4,
  check: (value): value is Set<unknown> => value instanceof Set,
  encode: (value, { instance }) => instance.encode(Array.from(value)),
  decode: (value, { instance }) => new Set(instance.decode<unknown[]>(value)),
};

export const mapExtension: Extension<Map<unknown, unknown>, Tagged> = {
  tag: 5,
  check: (value): value is Map<unknown, unknown> => value instanceof Map,
  encode: (value, { instance }) => instance.encode(Array.from(value.entries())),
  decode: (value, { instance }) => new Map(instance.decode<[unknown, unknown][]>(value)),
};

export const errorExtension: Extension<
  Error,
  Tagged<{
    name: string;
    message: string;
    cause: unknown;
    stack: string | undefined;
  }>
> = {
  tag: 6,
  check: (value): value is Error => value instanceof Error && value.constructor === Error,
  encode: ({ name, message, cause, stack }, { instance }) =>
    instance.encode({ name, message, cause, stack }),
  decode: (value, { instance }) => {
    const error = Object.create(Error.prototype);

    Object.defineProperties(
      error,
      Object.fromEntries(
        Object.entries(instance.decode(value)).map<[string, PropertyDescriptor]>(
          ([key, value]) => [key, { value, enumerable: false, writable: true }]
        )
      )
    );

    return error;
  },
};

export const urlExtension: Extension<URL, string> = {
  tag: 7,
  check: (value): value is URL => value instanceof URL,
  encode: (url) => url.toString(),
  decode: (value: string) => new URL(value),
};
