import { TypeIdRegistry } from "../registry.ts";
import type { JsonValue, Transformer } from "../types.ts";

export const setTransformer: Transformer<
  Set<unknown>,
  { values: JsonValue[] }
> = {
  encoder: {
    filter: { class: Set, object: ({ value }) => value instanceof Set },
    handler: ({ value, jasone }) => [
      TypeIdRegistry.Set,
      {
        values: value
          .values()
          .map((entry) => jasone.encode(entry))
          .toArray(),
      },
    ],
  },

  decoder: {
    filter: TypeIdRegistry.Set,
    handler: ({ value, jasone }) =>
      new Set(value.values.map((entry) => jasone.decode(entry))),
  },
};
