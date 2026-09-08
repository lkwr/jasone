// biome-ignore-all assist/source/organizeImports: already sorted by type id
import type { Transformer } from "../types.ts";
import { undefinedTransformer } from "./undefined.ts";
import { dateTransformer } from "./date.ts";
import { bigIntTransformer } from "./bigint.ts";
import { regExpTransformer } from "./regexp.ts";
import { setTransformer } from "./set.ts";
import { mapTransformer } from "./map.ts";
import { urlTransformer } from "./url.ts";

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
] as Transformer[];
