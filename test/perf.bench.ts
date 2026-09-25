import { expect, test } from "vitest";
import { Jasone } from "../src/index.ts";
import { isDecodable, isEncodable } from "../src/is.ts";
import type { JsonValue } from "../src/types.ts";

// Micro-benchmark: checking "can jasone handle this value?" two ways:
//   1. a boolean-returning helper that attempts the operation and catches the error
//   2. calling isEncodable/isDecodable

const jasone = new Jasone();

const value = {
  date: new Date("2025-01-01T00:00:00.000Z"),
  map: new Map<string, unknown>([["a", 1]]),
  set: new Set([1, 2, 3]),
  big: 9007199254740993n,
  missing: undefined,
  nested: {
    deep: [
      new Date(0),
      new Map([[1, new Set([2])]]),
      { url: new URL("https://example.com/") },
    ],
  },
};

const encodedValue = jasone.encode(value);
const undecodable: Record<string, JsonValue> = { $: 999, data: 1 };
const weakMap = new WeakMap();

// The try/catch check pattern as a real-world boolean-returning helper.
const tryEncode = (value: unknown): boolean => {
  try {
    jasone.encode(value);
    return true;
  } catch {
    return false;
  }
};

const tryDecode = (value: JsonValue): boolean => {
  try {
    jasone.decode(value);
    return true;
  } catch {
    return false;
  }
};

let sink: unknown;

test("check encode: encodable value", async ({ bench }) => {
  await bench.compare(
    bench("tryEncode (encode + try/catch)", () => {
      sink = tryEncode(value);
    }),
    bench("isEncodable", () => {
      sink = isEncodable(jasone, value);
    }),
  );

  expect(sink).toBe(true);
});

test("check encode: non-encodable value", async ({ bench }) => {
  await bench.compare(
    bench("tryEncode (throws)", () => {
      sink = tryEncode(weakMap);
    }),
    bench("isEncodable (returns false)", () => {
      sink = isEncodable(jasone, weakMap);
    }),
  );

  expect(sink).toBe(false);
});

test("check decode: decodable value", async ({ bench }) => {
  await bench.compare(
    bench("tryDecode (decode + try/catch)", () => {
      sink = tryDecode(encodedValue);
    }),
    bench("isDecodable", () => {
      sink = isDecodable(jasone, encodedValue);
    }),
  );

  expect(sink).toBe(true);
});

test("check decode: unknown type id", async ({ bench }) => {
  await bench.compare(
    bench("tryDecode (throws)", () => {
      sink = tryDecode(undecodable);
    }),
    bench("isDecodable (returns false)", () => {
      sink = isDecodable(jasone, undecodable);
    }),
  );

  expect(sink).toBe(false);
});
