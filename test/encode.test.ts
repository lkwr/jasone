import { describe, expect, test } from "bun:test";
import { $ } from "bun";
import { Jasone } from "../src/jasone.ts";

describe("encode", () => {
  test("primitives", () => {
    const jasone = new Jasone();

    // string
    expect(jasone.encode("test")).toEqual("test");

    // number
    expect(jasone.encode(123)).toEqual(123);

    // boolean
    expect(jasone.encode(true)).toEqual(true);
    expect(jasone.encode(false)).toEqual(false);

    // null
    expect(jasone.encode(null)).toEqual(null);

    // array
    expect(jasone.encode([1, 2, 3])).toEqual([1, 2, 3]);

    // object
    expect(jasone.encode({ a: 1, b: 2 })).toEqual({ a: 1, b: 2 });
  });

  test("object with type identifier", () => {
    const jasone = new Jasone();

    expect(jasone.encode({ $: 1, a: 2 })).toEqual({
      $: [1],
      a: 2,
    });

    expect(jasone.encode({ $: [1], a: 2 })).toEqual({
      $: [[1]],
      a: 2,
    });
  });

  test("custom types", () => {
    const jasone = new Jasone();

    jasone.register({
      target: Date,
      typeId: 0,
      encode: (date) => ({ timestamp: date.getTime() }),
      decode: ({ timestamp }) => new Date(timestamp),
    });

    jasone.register({
      matches: (value) => value === undefined,
      typeId: 1,
      encode: () => ({}),
      decode: () => undefined,
    });

    expect(jasone.encode(new Date(42_000))).toEqual({
      $: 0,
      timestamp: 42_000,
    });
    expect(jasone.encode(undefined)).toEqual({ $: 1 });
    expect(jasone.encode([1, new Date(42_000), "2", undefined])).toEqual([
      1,
      { $: 0, timestamp: 42_000 },
      "2",
      { $: 1 },
    ]);
    expect(() => jasone.encode(new Map())).toThrowError();
  });
});
