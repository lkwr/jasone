import { TypeIdRegistry } from "../registry.ts";
import type { Transformer } from "../types.ts";

export const urlTransformer: Transformer<URL, { url: string }> = {
  encoder: {
    filter: { class: URL, object: (obj) => obj instanceof URL },
    handler: ({ value }) => [TypeIdRegistry.URL, { url: value.toString() }],
  },
  decoder: {
    filter: TypeIdRegistry.URL,
    handler: ({ value }) => new URL(value.url),
  },
};
