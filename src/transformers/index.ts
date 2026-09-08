// biome-ignore-all assist/source/organizeImports: already sorted by type id
import type { Transformer } from "../types.ts";
import { undefinedTransformer } from "./undefined.ts";
import { dateTransformer } from "./date.ts";
import { bigIntTransformer } from "./bigint.ts";
import { regExpTransformer } from "./regexp.ts";
import { setTransformer } from "./set.ts";
import { mapTransformer } from "./map.ts";
import { urlTransformer } from "./url.ts";
import {
  temporalInstantTransformer,
  temporalZonedDateTimeTransformer,
  temporalPlainDateTransformer,
  temporalPlainTimeTransformer,
  temporalPlainDateTimeTransformer,
  temporalDurationTransformer,
  temporalPlainYearMonthTransformer,
  temporalPlainMonthDayTransformer,
  temporalTransformers,
} from "./temporal.ts";

export {
  // TypeId: 0 (undefined)
  undefinedTransformer,
  // TypeId: 1 (Date)
  dateTransformer,
  // TypeId: 2 (BigInt)
  bigIntTransformer,
  // TypeId: 3 (RegExp)
  regExpTransformer,
  // TypeId: 4 (Set)
  setTransformer,
  // TypeId: 5 (Map)
  mapTransformer,
  // TypeId: 6 (URL)
  urlTransformer,
  // TypeId: 7 (Temporal.Instant)
  temporalInstantTransformer,
  // TypeId: 10 (Temporal.ZonedDateTime)
  temporalZonedDateTimeTransformer,
  // TypeId: 11 (Temporal.PlainDate)
  temporalPlainDateTransformer,
  // TypeId: 12 (Temporal.PlainTime)
  temporalPlainTimeTransformer,
  // TypeId: 13 (Temporal.PlainDateTime)
  temporalPlainDateTimeTransformer,
  // TypeId: 14 (Temporal.Duration)
  temporalDurationTransformer,
  // TypeId: 15 (Temporal.PlainYearMonth)
  temporalPlainYearMonthTransformer,
  // TypeId: 16 (Temporal.PlainMonthDay)
  temporalPlainMonthDayTransformer,
  temporalTransformers,
};

/**
 * The built-in type transformers that are used by the default Jasone instance.
 */
export const builtInTransformers: Transformer[] = [
  undefinedTransformer,
  dateTransformer,
  bigIntTransformer,
  regExpTransformer,
  setTransformer,
  mapTransformer,
  urlTransformer,
  ...temporalTransformers,
] as Transformer[];
