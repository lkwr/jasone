import { describe, expect, test, vi } from "vitest";
import { Jasone } from "../../src/jasone.ts";
import { TypeIdRegistry } from "../../src/registry.ts";
import { temporalTransformers } from "../../src/transformers/temporal.ts";

const hasTemporal = (globalThis as { Temporal?: any }).Temporal !== undefined;

const jasone = new Jasone();

for (const transformer of temporalTransformers) jasone.register(transformer);

/**
 * Temporal instances cannot be compared with `toEqual` (they have no own
 * enumerable properties), so decoded values are compared via `equals` or,
 * for `Temporal.Duration` (which has no `equals`), via their string
 * representation.
 */
const expectTemporalEncodeDecode = (value: any) => {
  const decoded = jasone.decode(jasone.encode(value));

  expect<unknown>(decoded).toBeInstanceOf(value.constructor);

  if (typeof (decoded as any)?.equals === "function")
    expect((decoded as any).equals(value)).toBe(true);
  else expect(String(decoded)).toEqual(String(value));
};

describe("transformer: temporal", () => {
  test("registered type ids", () => {
    expect(temporalTransformers).toHaveLength(8);

    // Instant is the most common Temporal type and gets the remaining
    // single-digit id; the rest start at 10.
    expect(TypeIdRegistry.TemporalInstant).toBe(7);
    expect(TypeIdRegistry.TemporalZonedDateTime).toBe(10);
    expect(TypeIdRegistry.TemporalPlainDate).toBe(11);
    expect(TypeIdRegistry.TemporalPlainTime).toBe(12);
    expect(TypeIdRegistry.TemporalPlainDateTime).toBe(13);
    expect(TypeIdRegistry.TemporalDuration).toBe(14);
    expect(TypeIdRegistry.TemporalPlainYearMonth).toBe(15);
    expect(TypeIdRegistry.TemporalPlainMonthDay).toBe(16);
  });

  test("type: Temporal.Instant", { skip: !hasTemporal }, () => {
    expectTemporalEncodeDecode(Temporal.Instant.from("2025-04-05T12:30:00Z"));
    expectTemporalEncodeDecode(
      Temporal.Instant.from("2025-04-05T12:30:00.123456789Z"),
    );

    expect(
      jasone.encode(Temporal.Instant.from("2025-04-05T12:30:00Z")),
    ).toEqual({
      $: TypeIdRegistry.TemporalInstant,
      iso: "2025-04-05T12:30:00Z",
    });
  });

  test("type: Temporal.PlainDate", { skip: !hasTemporal }, () => {
    expectTemporalEncodeDecode(Temporal.PlainDate.from("2025-04-05"));

    expect(jasone.encode(Temporal.PlainDate.from("2025-04-05"))).toEqual({
      $: TypeIdRegistry.TemporalPlainDate,
      iso: "2025-04-05",
    });
  });

  test("type: Temporal.PlainTime", { skip: !hasTemporal }, () => {
    expectTemporalEncodeDecode(Temporal.PlainTime.from("14:30"));
    expectTemporalEncodeDecode(Temporal.PlainTime.from("14:30:00.123456789"));
  });

  test("type: Temporal.PlainDateTime", { skip: !hasTemporal }, () => {
    expectTemporalEncodeDecode(
      Temporal.PlainDateTime.from("2025-04-05T14:30:00"),
    );
    expectTemporalEncodeDecode(
      Temporal.PlainDateTime.from("2025-04-05T14:30:00.123456789"),
    );
  });

  test("type: Temporal.ZonedDateTime", { skip: !hasTemporal }, () => {
    expectTemporalEncodeDecode(
      Temporal.ZonedDateTime.from("2025-04-05T14:30:00+02:00[Europe/Berlin]"),
    );
    expectTemporalEncodeDecode(
      Temporal.ZonedDateTime.from(
        "2025-04-05T14:30:00.123456789+02:00[Europe/Berlin]",
      ),
    );
  });

  test("type: Temporal.Duration", { skip: !hasTemporal }, () => {
    expectTemporalEncodeDecode(Temporal.Duration.from("P1DT2H30M"));
    expectTemporalEncodeDecode(Temporal.Duration.from("-P1D"));
    expectTemporalEncodeDecode(Temporal.Duration.from("PT0.123456789S"));
  });

  test("type: Temporal.PlainYearMonth", { skip: !hasTemporal }, () => {
    expectTemporalEncodeDecode(Temporal.PlainYearMonth.from("2025-04"));
  });

  test("type: Temporal.PlainMonthDay", { skip: !hasTemporal }, () => {
    expectTemporalEncodeDecode(Temporal.PlainMonthDay.from("04-05"));
  });

  test("nested and composed values", { skip: !hasTemporal }, () => {
    expectTemporalEncodeDecode({
      instant: Temporal.Instant.from("2025-04-05T12:30:00.123456789Z"),
      dates: [
        Temporal.PlainDate.from("2025-04-05"),
        Temporal.Duration.from("P1D"),
      ],
      nested: {
        zoned: Temporal.ZonedDateTime.from(
          "2025-04-05T14:30:00+02:00[Europe/Berlin]",
        ),
      },
    });
  });

  test("invalid encoded payload", { skip: !hasTemporal }, () => {
    expect(() =>
      jasone.decode({ $: TypeIdRegistry.TemporalPlainDate, iso: "invalid" }),
    ).toThrow();
  });

  test("late-loaded Temporal implementation", {
    skip: !hasTemporal,
  }, async () => {
    const globalScope = globalThis as { Temporal?: typeof Temporal };
    const original = globalScope.Temporal;

    delete globalScope.Temporal;

    try {
      // Re-import the modules so they register without a Temporal global.
      vi.resetModules();

      const { Jasone: FreshJasone } = await import("../../src/jasone.ts");
      const { temporalTransformers: freshTemporalTransformers } = await import(
        "../../src/transformers/temporal.ts"
      );

      const freshJasone = new FreshJasone();

      for (const transformer of freshTemporalTransformers)
        freshJasone.register(transformer);

      // Simulate a polyfill that is loaded after jasone was imported.
      globalScope.Temporal = original;

      const value = Temporal.PlainDate.from("2025-04-05");
      const decoded = freshJasone.decode<Temporal.PlainDate>(
        freshJasone.encode(value),
      );

      expect(decoded).toBeInstanceOf(value.constructor);
      expect(decoded.equals(value)).toBe(true);
    } finally {
      if (original !== undefined) globalScope.Temporal = original;

      vi.resetModules();
    }
  });

  test("decoding without runtime support", async () => {
    const globalScope = globalThis as { Temporal?: typeof Temporal };
    const original = globalScope.Temporal;

    delete globalScope.Temporal;
    expect("Temporal" in globalThis).toBe(false);

    try {
      // Re-import the modules so they evaluate without a Temporal global.
      vi.resetModules();

      const { Jasone: FreshJasone } = await import("../../src/jasone.ts");
      const { builtInTransformers: freshBuiltInTransformers } = await import(
        "../../src/transformers/index.ts"
      );
      const { TemporalNotSupportedError } = await import("../../src/error.ts");

      const freshJasone = new FreshJasone({
        transformers: freshBuiltInTransformers,
      });

      // Non-temporal values are unaffected.
      expect(
        freshJasone.decode(freshJasone.encode({ date: new Date(0) })),
      ).toEqual({ date: new Date(0) });
      expect(freshJasone.decode(freshJasone.encode(new Set([1n])))).toEqual(
        new Set([1n]),
      );
      expect(
        freshJasone.decode(freshJasone.encode({ a: undefined, b: 1 })),
      ).toEqual({ a: undefined, b: 1 });
      expect(
        freshJasone.decode(
          freshJasone.encode({ nested: { deep: [1, "two", null, true] } }),
        ),
      ).toEqual({ nested: { deep: [1, "two", null, true] } });

      // Decoding Temporal data fails with a descriptive error.
      expect(() =>
        freshJasone.decode({
          $: TypeIdRegistry.TemporalPlainDate,
          iso: "2025-04-05",
        }),
      ).toThrow(TemporalNotSupportedError);
    } finally {
      if (original !== undefined) globalScope.Temporal = original;

      vi.resetModules();
    }
  });
});
