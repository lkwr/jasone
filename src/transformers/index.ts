import type { Transformer } from "../types.ts";
import { bigIntTransformer } from "./bigint.ts";
import { dateTransformer } from "./date.ts";
import { mapTransformer } from "./map.ts";
import { regExpTransformer } from "./regexp.ts";
import { setTransformer } from "./set.ts";
import { undefinedTransformer } from "./undefined.ts";
import { urlTransformer } from "./url.ts";

export type {
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
};

/**
 * The default type transformers that are used by the default Jasone instance.
 */
export const defaultTransformers: Transformer[] = [
  undefinedTransformer,
  dateTransformer,
  bigIntTransformer,
  regExpTransformer,
  setTransformer,
  mapTransformer,
  urlTransformer,
] as Transformer[];
