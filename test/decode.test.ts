import { describe, expect, test } from "bun:test";
import { $ } from "bun";
import { Jasone } from "../src/jasone.ts";

describe("encode", () => {
  test("primitives", () => {
    const jasone = new Jasone();

    // string
    expect(jasone.decode<unknown>("test")).toEqual("test");

    // number
    expect(jasone.decode<unknown>(123)).toEqual(123);

    // boolean
    expect(jasone.decode<unknown>(true)).toEqual(true);
    expect(jasone.decode<unknown>(false)).toEqual(false);

    // null
    expect(jasone.decode<unknown>(null)).toEqual(null);

    // array
    expect(jasone.decode<unknown>([1, 2, 3])).toEqual([1, 2, 3]);

    // object
    expect(jasone.decode<unknown>({ a: 1, b: 2 })).toEqual({ a: 1, b: 2 });
  });

  test("object with type identifier", () => {
    const jasone = new Jasone();

    expect(
      jasone.decode<unknown>({
        $: null,
        "@": {
          $: 1,
          a: 2,
        },
      }),
    ).toEqual({ $: 1, a: 2 });
  });

  test("custom types", () => {
    const jasone = new Jasone();

    jasone.register({
      target: Date,
      typeId: 0,
      encode: (date) => date.getTime(),
      decode: (value) => new Date(value),
    });

    jasone.register({
      matches: (value) => value === undefined,
      typeId: 1,
      encode: () => ({}),
      decode: () => undefined,
    });

    expect(jasone.decode<unknown>({ $: 0, "@": 0 })).toEqual(new Date(0));
    expect(jasone.decode<unknown>({ $: 1 })).toEqual(undefined);
    expect(
      jasone.decode<unknown>([1, { $: 0, "@": 0 }, "2", { $: 1 }]),
    ).toEqual([1, new Date(0), "2", undefined]);
    expect(() =>
      jasone.decode<unknown>({ $: 123, error: true }),
    ).toThrowError();
  });
});
