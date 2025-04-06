import type { TypeTransformer } from "../transformer.ts";
import { bigIntType } from "./bigint.ts";
import { dateType } from "./date.ts";
import { mapType } from "./map.ts";
import { regExpType } from "./regexp.ts";
import { setType } from "./set.ts";
import { undefinedType } from "./undefined.ts";
import { urlType } from "./url.ts";

export {
  // TypeId: 0 (undefined)
  undefinedType,
  // TypeId: 1 (Date)
  dateType,
  // TypeId: 2 (BigInt)
  bigIntType,
  // TypeId: 3 (RegExp)
  regExpType,
  // TypeId: 4 (Set)
  setType,
  // TypeId: 5 (Map)
  mapType,
  // TypeId: 6 (URL)
  urlType,
};

/**
 * The default types that are used by the default Jasone instance.
 */
export const defaultTypes: TypeTransformer<any, any>[] = [
  undefinedType,
  dateType,
  bigIntType,
  regExpType,
  setType,
  mapType,
  urlType,
];
