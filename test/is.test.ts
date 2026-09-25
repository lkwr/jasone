import { describe, expect, test } from "vitest";
import { builtInTransformers, Jasone as JasoneWrapper } from "../src/index.ts";
import { isDecodable, isEncodable } from "../src/is.ts";
import { Jasone } from "../src/jasone.ts";
import type { JsonValue } from "../src/types.ts";

describe("isEncodable", () => {
  test("json values are always encodable", () => {
    const jasone = new Jasone();

    expect(isEncodable(jasone, "test")).toBe(true);
    expect(isEncodable(jasone, 123)).toBe(true);
    expect(isEncodable(jasone, true)).toBe(true);
    expect(isEncodable(jasone, null)).toBe(true);
    expect(isEncodable(jasone, [1, 2, 3])).toBe(true);
    expect(isEncodable(jasone, { a: 1, b: [true, null] })).toBe(true);
  });

  test("nested unhandled values", () => {
    const jasone = new Jasone();

    expect(isEncodable(jasone, undefined)).toBe(false);
    expect(isEncodable(jasone, 1n)).toBe(false);
    expect(isEncodable(jasone, new Date())).toBe(false);
    expect(isEncodable(jasone, [1, undefined, 3])).toBe(false);
    expect(isEncodable(jasone, { a: 1, b: new Date() })).toBe(false);
  });

  test("with registered encoders", () => {
    const jasone = new Jasone();

    jasone.register<Date, { iso: string }>({
      encoder: {
        filter: { class: Date },
        handler: ({ value }) => [1, { iso: value.toISOString() }],
      },
    });

    expect(isEncodable(jasone, new Date())).toBe(true);
    expect(isEncodable(jasone, { date: [new Date()] })).toBe(true);
    expect(isEncodable(jasone, new Map())).toBe(false);
  });

  test("with default types", () => {
    const jasone = new Jasone({ transformers: builtInTransformers });

    expect(isEncodable(jasone, new Date())).toBe(true);
    expect(isEncodable(jasone, 1n)).toBe(true);
    expect(isEncodable(jasone, new Set([1]))).toBe(true);
    expect(isEncodable(jasone, [undefined, { date: new Date() }])).toBe(true);

    // proto-less objects have no registered encoder
    expect(isEncodable(jasone, Object.create(null))).toBe(false);
  });

  test("with the wrapper instance", () => {
    const jasone = new JasoneWrapper();

    expect(isEncodable(jasone, new Date())).toBe(true);
    expect(isEncodable(jasone, new WeakMap())).toBe(false);
  });

  test("falls back to custom and any encoders", () => {
    const jasone = new Jasone();

    class Foo {}
    class Bar {}

    jasone.register<Foo, { foo: true }>({
      encoder: {
        filter: { class: Foo },
        handler: () => [1, { foo: true }],
      },
    });
    jasone.register<Bar, { bar: true }>({
      encoder: {
        filter: { object: ({ value }) => value instanceof Bar },
        handler: () => [2, { bar: true }],
      },
    });

    expect(isEncodable(jasone, new Foo())).toBe(true);
    expect(isEncodable(jasone, new Bar())).toBe(true);
    expect(isEncodable(jasone, new Date())).toBe(false);
  });

  test("encoders without filter match any value", () => {
    const jasone = new Jasone();

    jasone.register({
      encoder: { handler: () => [null, { value: 1 }] },
    });

    expect(isEncodable(jasone, new Date())).toBe(true);
    expect(isEncodable(jasone, undefined)).toBe(true);
    expect(isEncodable(jasone, Symbol("test"))).toBe(true);
  });

  test("encoder filters receive context", () => {
    const jasone = new Jasone();

    jasone.register({
      encoder: {
        filter: { object: ({ context }) => context.encode === true },
        handler: () => [null, {}],
      },
    });

    expect(isEncodable(jasone, new Date(), { encode: true })).toBe(true);
    expect(isEncodable(jasone, new Date())).toBe(false);
  });
});

describe("isDecodable", () => {
  test("json values are always decodable", () => {
    const jasone = new Jasone();

    expect(isDecodable(jasone, "test")).toBe(true);
    expect(isDecodable(jasone, 123)).toBe(true);
    expect(isDecodable(jasone, true)).toBe(true);
    expect(isDecodable(jasone, null)).toBe(true);
    expect(isDecodable(jasone, [1, 2, 3])).toBe(true);
    expect(isDecodable(jasone, { a: 1, b: [true, null] })).toBe(true);
  });

  test("escaped type identifiers", () => {
    const jasone = new Jasone();

    expect(isDecodable(jasone, { $: [1], a: 2 })).toBe(true);
    expect(isDecodable(jasone, { $: [[1]], a: 2 })).toBe(true);
  });

  test("unknown type ids", () => {
    const jasone = new Jasone();

    expect(isDecodable(jasone, { $: 1 })).toBe(false);
    expect(isDecodable(jasone, [1, { $: 99 }])).toBe(false);
    expect(isDecodable(jasone, { a: { $: 1, b: 2 } })).toBe(false);
  });

  test("with registered decoders", () => {
    const jasone = new Jasone();

    jasone.register<Date, { iso: string }>({
      decoder: {
        filter: 1,
        handler: ({ value }) => new Date(value.iso),
      },
    });

    expect(isDecodable(jasone, { $: 1, iso: "1970-01-01T00:00:00.000Z" })).toBe(
      true,
    );
    expect(
      isDecodable(jasone, [{ $: 1, iso: "1970-01-01T00:00:00.000Z" }]),
    ).toBe(true);
    expect(isDecodable(jasone, { $: 0 })).toBe(false);
  });

  test("with default types", () => {
    const jasone = new Jasone({ transformers: builtInTransformers });

    expect(isDecodable(jasone, { $: 1, iso: "1970-01-01T00:00:00.000Z" })).toBe(
      true,
    );
    expect(isDecodable(jasone, { $: 2, bigint: "1000" })).toBe(true);
    expect(
      isDecodable(jasone, [1, { $: 0 }, { nested: { $: 4, values: [1] } }]),
    ).toBe(true);

    expect(isDecodable(jasone, { $: 123, error: true })).toBe(false);
    expect(isDecodable(jasone, [1, { $: 123 }])).toBe(false);
  });

  test("with the wrapper instance", () => {
    const jasone = new JasoneWrapper();

    expect(isDecodable(jasone, { $: 1, iso: "1970-01-01T00:00:00.000Z" })).toBe(
      true,
    );
    expect(isDecodable(jasone, { $: 123 })).toBe(false);
  });

  test("non json values", () => {
    const jasone = new Jasone({ transformers: builtInTransformers });

    // proto-less objects
    expect(isDecodable(jasone, Object.create(null))).toBe(false);
    expect(isDecodable(jasone, [Object.create(null)])).toBe(false);
  });

  test("round trips encoded values", () => {
    const jasone = new Jasone({ transformers: builtInTransformers });

    expect(isDecodable(jasone, jasone.encode(new Date(42_000)))).toBe(true);
    expect(
      isDecodable(jasone, jasone.encode([undefined, new Set([1, 2])])),
    ).toBe(true);
    // non-encodable values are detected before decoding is even attempted
    expect(isEncodable(jasone, new WeakMap())).toBe(false);
  });

  test("any decoders", () => {
    const jasone = new Jasone();

    jasone.register<unknown, Record<string, JsonValue>>({
      decoder: {
        filter: ({ typeId, context }) =>
          typeId === "Secret" && context.allowed === true,
        handler: () => "secret",
      },
    });

    expect(
      isDecodable(jasone, { $: "Secret", data: 1 }, { allowed: true }),
    ).toBe(true);
    expect(isDecodable(jasone, { $: "Secret", data: 1 })).toBe(false);
    expect(isDecodable(jasone, { $: "Other" })).toBe(false);
  });
});
