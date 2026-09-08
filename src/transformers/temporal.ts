import { TemporalNotSupportedError } from "../error.ts";
import { TypeIdRegistry } from "../registry.ts";
import type { ClassLike, Transformer } from "../types.ts";

const getTemporal = <T>(fallback: () => T): typeof Temporal | T => {
  if ("Temporal" in globalThis && globalThis.Temporal) return Temporal;
  return fallback();
};

type TemporalClasses = {
  Instant: Temporal.Instant;
  ZonedDateTime: Temporal.ZonedDateTime;
  PlainDate: Temporal.PlainDate;
  PlainTime: Temporal.PlainTime;
  PlainDateTime: Temporal.PlainDateTime;
  Duration: Temporal.Duration;
  PlainYearMonth: Temporal.PlainYearMonth;
  PlainMonthDay: Temporal.PlainMonthDay;
};

const createTemporalTransformer = <T extends keyof TemporalClasses>(
  type: T,
  typeId: number,
): Transformer<TemporalClasses[T], { iso: string }> => ({
  encoder: {
    filter: {
      class: getTemporal(() => undefined)?.[type] as
        | ClassLike<TemporalClasses[T]>
        | undefined,
      object: ({ value }) => {
        const temporalClass = getTemporal(() => undefined)?.[type];
        return temporalClass ? value instanceof temporalClass : false;
      },
    },
    handler: ({ value }) => [typeId, { iso: value.toString() }],
  },
  decoder: {
    filter: typeId,
    handler: ({ value }) =>
      getTemporal(() => {
        throw new TemporalNotSupportedError(type);
      })[type].from(value.iso) as TemporalClasses[T],
  },
});

export const temporalInstantTransformer = createTemporalTransformer(
  "Instant",
  TypeIdRegistry.TemporalInstant,
);
export const temporalZonedDateTimeTransformer = createTemporalTransformer(
  "ZonedDateTime",
  TypeIdRegistry.TemporalZonedDateTime,
);
export const temporalPlainDateTransformer = createTemporalTransformer(
  "PlainDate",
  TypeIdRegistry.TemporalPlainDate,
);
export const temporalPlainTimeTransformer = createTemporalTransformer(
  "PlainTime",
  TypeIdRegistry.TemporalPlainTime,
);
export const temporalPlainDateTimeTransformer = createTemporalTransformer(
  "PlainDateTime",
  TypeIdRegistry.TemporalPlainDateTime,
);
export const temporalDurationTransformer = createTemporalTransformer(
  "Duration",
  TypeIdRegistry.TemporalDuration,
);
export const temporalPlainYearMonthTransformer = createTemporalTransformer(
  "PlainYearMonth",
  TypeIdRegistry.TemporalPlainYearMonth,
);
export const temporalPlainMonthDayTransformer = createTemporalTransformer(
  "PlainMonthDay",
  TypeIdRegistry.TemporalPlainMonthDay,
);

/**
 * All built-in Temporal transformers.
 *
 * The transformers are registered even if the runtime does not support
 * Temporal. In that case, encoding Temporal values is impossible anyway
 * (the runtime cannot create them), decoding Temporal data fails with a
 * {@link TemporalNotSupportedError}, and everything else keeps working.
 */
export const temporalTransformers: Transformer[] = [
  temporalInstantTransformer,
  temporalZonedDateTimeTransformer,
  temporalPlainDateTransformer,
  temporalPlainTimeTransformer,
  temporalPlainDateTimeTransformer,
  temporalDurationTransformer,
  temporalPlainYearMonthTransformer,
  temporalPlainMonthDayTransformer,
] as Transformer[];
