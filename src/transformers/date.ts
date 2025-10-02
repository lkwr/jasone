import { TypeIdRegistry } from "../registry.ts";
import type { Transformer } from "../types.ts";

export const dateTransformer: Transformer<Date, { iso: string }> = {
  encoder: {
    filter: { class: Date, object: ({ value }) => value instanceof Date },
    handler: ({ value }) => [TypeIdRegistry.Date, { iso: value.toISOString() }],
  },
  decoder: {
    filter: TypeIdRegistry.Date,
    handler: ({ value }) => new Date(value.iso),
  },
};
