import { TypeIdRegistry } from "../registry.ts";
import type { Transformer } from "../types.ts";

export const undefinedTransformer: Transformer<undefined, {}> = {
  encoder: {
    filter: { undefined: true },
    handler: () => [TypeIdRegistry.Undefined, {}],
  },
  decoder: {
    filter: TypeIdRegistry.Undefined,
    handler: () => undefined,
  },
};
