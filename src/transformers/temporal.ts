import { TemporalNotSupportedError } from "../error.ts";
import { TypeIdRegistry } from "../registry.ts";
import type { Transformer } from "../types.ts";

const getTemporal = <T>(fallback: () => T): typeof Temporal | T => {
  if ("Temporal" in globalThis && globalThis.Temporal) return Temporal;
  return fallback();
};

export const temporalInstantTransformer: Transformer<
  Temporal.Instant,
  { iso: string }
> = {
  encoder: {
    filter: {
      class: getTemporal(() => undefined)?.Instant,
      object: ({ value }) => {
        const instant = getTemporal(() => undefined)?.Instant;
        return instant ? value instanceof instant : false;
      },
    },
    handler: ({ value }) => [
      TypeIdRegistry.TemporalInstant,
      { iso: value.toString() },
    ],
  },
  decoder: {
    filter: TypeIdRegistry.TemporalInstant,
    handler: ({ value }) =>
      getTemporal(() => {
        throw new TemporalNotSupportedError("Instant");
      }).Instant.from(value.iso),
  },
};

export const temporalZonedDateTimeTransformer: Transformer<
  Temporal.ZonedDateTime,
  { iso: string }
> = {
  encoder: {
    filter: {
      class: getTemporal(() => undefined)?.ZonedDateTime,
      object: ({ value }) => {
        const zonedDateTime = getTemporal(() => undefined)?.ZonedDateTime;
        return zonedDateTime ? value instanceof zonedDateTime : false;
      },
    },
    handler: ({ value }) => [
      TypeIdRegistry.TemporalZonedDateTime,
      { iso: value.toString() },
    ],
  },
  decoder: {
    filter: TypeIdRegistry.TemporalZonedDateTime,
    handler: ({ value }) =>
      getTemporal(() => {
        throw new TemporalNotSupportedError("ZonedDateTime");
      }).ZonedDateTime.from(value.iso),
  },
};

export const temporalPlainDateTransformer: Transformer<
  Temporal.PlainDate,
  { iso: string }
> = {
  encoder: {
    filter: {
      class: getTemporal(() => undefined)?.PlainDate,
      object: ({ value }) => {
        const plainDate = getTemporal(() => undefined)?.PlainDate;
        return plainDate ? value instanceof plainDate : false;
      },
    },
    handler: ({ value }) => [
      TypeIdRegistry.TemporalPlainDate,
      { iso: value.toString() },
    ],
  },
  decoder: {
    filter: TypeIdRegistry.TemporalPlainDate,
    handler: ({ value }) =>
      getTemporal(() => {
        throw new TemporalNotSupportedError("PlainDate");
      }).PlainDate.from(value.iso),
  },
};

export const temporalPlainTimeTransformer: Transformer<
  Temporal.PlainTime,
  { iso: string }
> = {
  encoder: {
    filter: {
      class: getTemporal(() => undefined)?.PlainTime,
      object: ({ value }) => {
        const plainTime = getTemporal(() => undefined)?.PlainTime;
        return plainTime ? value instanceof plainTime : false;
      },
    },
    handler: ({ value }) => [
      TypeIdRegistry.TemporalPlainTime,
      { iso: value.toString() },
    ],
  },
  decoder: {
    filter: TypeIdRegistry.TemporalPlainTime,
    handler: ({ value }) =>
      getTemporal(() => {
        throw new TemporalNotSupportedError("PlainTime");
      }).PlainTime.from(value.iso),
  },
};

export const temporalPlainDateTimeTransformer: Transformer<
  Temporal.PlainDateTime,
  { iso: string }
> = {
  encoder: {
    filter: {
      class: getTemporal(() => undefined)?.PlainDateTime,
      object: ({ value }) => {
        const plainDateTime = getTemporal(() => undefined)?.PlainDateTime;
        return plainDateTime ? value instanceof plainDateTime : false;
      },
    },
    handler: ({ value }) => [
      TypeIdRegistry.TemporalPlainDateTime,
      { iso: value.toString() },
    ],
  },
  decoder: {
    filter: TypeIdRegistry.TemporalPlainDateTime,
    handler: ({ value }) =>
      getTemporal(() => {
        throw new TemporalNotSupportedError("PlainDateTime");
      }).PlainDateTime.from(value.iso),
  },
};

export const temporalDurationTransformer: Transformer<
  Temporal.Duration,
  { iso: string }
> = {
  encoder: {
    filter: {
      class: getTemporal(() => undefined)?.Duration,
      object: ({ value }) => {
        const duration = getTemporal(() => undefined)?.Duration;
        return duration ? value instanceof duration : false;
      },
    },
    handler: ({ value }) => [
      TypeIdRegistry.TemporalDuration,
      { iso: value.toString() },
    ],
  },
  decoder: {
    filter: TypeIdRegistry.TemporalDuration,
    handler: ({ value }) =>
      getTemporal(() => {
        throw new TemporalNotSupportedError("Duration");
      }).Duration.from(value.iso),
  },
};

export const temporalPlainYearMonthTransformer: Transformer<
  Temporal.PlainYearMonth,
  { iso: string }
> = {
  encoder: {
    filter: {
      class: getTemporal(() => undefined)?.PlainYearMonth,
      object: ({ value }) => {
        const plainYearMonth = getTemporal(() => undefined)?.PlainYearMonth;
        return plainYearMonth ? value instanceof plainYearMonth : false;
      },
    },
    handler: ({ value }) => [
      TypeIdRegistry.TemporalPlainYearMonth,
      { iso: value.toString() },
    ],
  },
  decoder: {
    filter: TypeIdRegistry.TemporalPlainYearMonth,
    handler: ({ value }) =>
      getTemporal(() => {
        throw new TemporalNotSupportedError("PlainYearMonth");
      }).PlainYearMonth.from(value.iso),
  },
};

export const temporalPlainMonthDayTransformer: Transformer<
  Temporal.PlainMonthDay,
  { iso: string }
> = {
  encoder: {
    filter: {
      class: getTemporal(() => undefined)?.PlainMonthDay,
      object: ({ value }) => {
        const plainMonthDay = getTemporal(() => undefined)?.PlainMonthDay;
        return plainMonthDay ? value instanceof plainMonthDay : false;
      },
    },
    handler: ({ value }) => [
      TypeIdRegistry.TemporalPlainMonthDay,
      { iso: value.toString() },
    ],
  },
  decoder: {
    filter: TypeIdRegistry.TemporalPlainMonthDay,
    handler: ({ value }) =>
      getTemporal(() => {
        throw new TemporalNotSupportedError("PlainMonthDay");
      }).PlainMonthDay.from(value.iso),
  },
};

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
