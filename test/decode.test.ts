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

    jasone.register<Date, { iso: string }>({
      encoder: {
        filter: { class: Date },
        handler: ({ value }) => [1, { iso: value.toISOString() }],
      },
      decoder: {
        filter: 1,
        handler: ({ value }) => new Date(value.iso),
      },
    });

    jasone.register({
      encoder: {
        filter: { undefined: true },
        handler: () => [0, {}],
      },
      decoder: {
        filter: 0,
        handler: () => undefined,
      },
    });

    expect(
      jasone.decode<unknown>({ $: 1, iso: "1970-01-01T00:00:00.000Z" }),
    ).toEqual(new Date("1970-01-01T00:00:00.000Z"));
    expect(jasone.decode<unknown>({ $: 0 })).toEqual(undefined);
    expect(
      jasone.decode<unknown>([
        1,
        { $: 1, iso: "1970-01-01T00:00:00.000Z" },
        "2",
        { $: 0 },
      ]),
    ).toEqual([1, new Date("1970-01-01T00:00:00.000Z"), "2", undefined]);
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
          date: { $: 1, iso: "1970-01-01T00:00:00.000Z" },
          bigint: { $: 2, bigint: "1000" },
          regexp: { $: 3, source: "[a-z]+", flags: "gi" },
          set: { $: 4, values: [1] },
          map: { $: 5, entries: [[1, 2]] },
          url: { $: 6, url: "https://example.com/" },
          nested: {
            $: 4,
            values: [
              {
                $: 4,
                values: [
                  {
                    $: 5,
                    entries: [
                      [
                        { $: 1, iso: "2000-01-01T00:00:00.000Z" },
                        "my key is a date",
                      ],
                    ],
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
        date: new Date("1970-01-01T00:00:00.000Z"),
        bigint: 1000n,
        regexp: /[a-z]+/gi,
        set: new Set([1]),
        map: new Map([[1, 2]]),
        url: new URL("https://example.com/"),
        nested: new Set([
          new Set([
            new Map([
              [new Date("2000-01-01T00:00:00.000Z"), "my key is a date"],
            ]),
          ]),
        ]),
      },
    ]);
  });
});
