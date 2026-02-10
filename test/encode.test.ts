import { describe, expect, test } from "bun:test";
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

    expect(jasone.encode(new Date(42_000))).toEqual({
      $: 1,
      iso: "1970-01-01T00:00:42.000Z",
    });
    expect(jasone.encode(undefined)).toEqual({ $: 0 });
    expect(jasone.encode([1, new Date(42_000), "2", undefined])).toEqual([
      1,
      { $: 1, iso: "1970-01-01T00:00:42.000Z" },
      "2",
      { $: 0 },
    ]);
    expect(() => jasone.encode(new Map())).toThrowError();
  });

  test("with default types", () => {
    expect(
      Jasone.encode([
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
                [new Date("1970-01-01T00:00:01.000Z"), "my key is a date"],
              ]),
            ]),
          ]),
        },
      ]),
    ).toEqual([
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
                      { $: 1, iso: "1970-01-01T00:00:01.000Z" },
                      "my key is a date",
                    ],
                  ],
                },
              ],
            },
          ],
        },
      },
    ]);
  });

  test("with blobs using context", async () => {
    const jasone = new Jasone({ transformers: [] });

    jasone.register<Blob, { id: number }, { blobs?: Blob[] }>({
      encoder: {
        filter: { object: ({ value }) => value instanceof Blob },
        handler: ({ value, context }) => {
          context.blobs ??= [];
          const id = context.blobs.push(value) - 1;

          return ["Blob", { id }];
        },
      },
    });

    const ctx = { blobs: [] as Blob[] };
    const data = {
      blob1: new Blob(["hello"], { type: "text/plain" }),
      blob2: new Blob(['"world"'], { type: "application/json" }),
    };

    const encoded = jasone.encode(data, ctx);

    expect(encoded).toEqual({
      blob1: { $: "Blob", id: 0 },
      blob2: { $: "Blob", id: 1 },
    });

    expect(await ctx.blobs[0]?.text()).toEqual("hello");
    expect(ctx.blobs[0]?.size).toEqual(data.blob1.size);
    expect(ctx.blobs[0]?.type).toEqual(data.blob1.type);

    expect(await ctx.blobs[1]?.text()).toEqual('"world"');
    expect(ctx.blobs[1]?.size).toEqual(data.blob2.size);
    expect(ctx.blobs[1]?.type).toEqual(data.blob2.type);
  });
});
