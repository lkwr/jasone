import { describe, expect, test } from "bun:test";
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
        $: [1],
        a: 2,
      }),
    ).toEqual({ $: 1, a: 2 });

    expect(
      jasone.decode<unknown>({
        $: [[1]],
        a: 2,
      }),
    ).toEqual({ $: [1], a: 2 });
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

    expect(jasone.decode<unknown>({ $: 0, timestamp: 0 })).toEqual(new Date(0));
    expect(jasone.decode<unknown>({ $: 1 })).toEqual(undefined);
    expect(
      jasone.decode<unknown>([1, { $: 0, timestamp: 0 }, "2", { $: 1 }]),
    ).toEqual([1, new Date(0), "2", undefined]);
    expect(() =>
      jasone.decode<unknown>({ $: 123, error: true }),
    ).toThrowError();
  });

  test("with default types", () => {
    expect(
      Jasone.decode<unknown>([
        {
          num: 1,
          undefined: { $: 0 },
          date: { $: 1, timestamp: 0 },
          bigint: { $: 2, bigint: "1000" },
          regexp: { $: 3, source: "[a-z]+", flags: "gi" },
          set: { $: 4, set: [1] },
          map: { $: 5, map: [[1, 2]] },
          url: { $: 6, url: "https://example.com/" },
          nested: {
            $: 4,
            set: [
              {
                $: 4,
                set: [
                  {
                    $: 5,
                    map: [[{ $: 1, timestamp: 1000 }, "my key is a date"]],
                  },
                ],
              },
            ],
          },
        },
      ]),
    ).toEqual([
      {
        num: 1,
        undefined: undefined,
        date: new Date(0),
        bigint: 1000n,
        regexp: /[a-z]+/gi,
        set: new Set([1]),
        map: new Map([[1, 2]]),
        url: new URL("https://example.com/"),
        nested: new Set([
          new Set([new Map([[new Date(1000), "my key is a date"]])]),
        ]),
      },
    ]);
  });
});
