import { TypeIdRegistry } from "../registry.ts";
import type { Transformer } from "../types.ts";

export const regExpTransformer: Transformer<
  RegExp,
  { source: string; flags: string }
> = {
  encoder: {
    filter: { class: RegExp, object: (obj) => obj instanceof RegExp },
    handler: ({ value }) => [
      TypeIdRegistry.RegExp,
      { source: value.source, flags: value.flags },
    ],
  },
  decoder: {
    filter: TypeIdRegistry.RegExp,
    handler: ({ value }) => new RegExp(value.source, value.flags),
  },
};
