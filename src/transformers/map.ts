import { TypeIdRegistry } from "../registry.ts";
import type { JsonValue, Transformer } from "../types.ts";

export const mapTransformer: Transformer<
  Map<unknown, unknown>,
  { entries: [key: JsonValue, value: JsonValue][] }
> = {
  encoder: {
    filter: { class: Map, object: (obj) => obj instanceof Map },
    handler: ({ value, jasone }) => [
      TypeIdRegistry.Map,
      {
        entries: value
          .entries()
          .map<[JsonValue, JsonValue]>(([key, val]) => [
            jasone.encode(key),
            jasone.encode(val),
          ])
          .toArray(),
      },
    ],
  },

  decoder: {
    filter: TypeIdRegistry.Map,
    handler: ({ value, jasone }) =>
      new Map(
        value.entries.map<[unknown, unknown]>(([key, val]) => [
          jasone.decode(key),
          jasone.decode(val),
        ]),
      ),
  },
};
