import { TypeIdRegistry } from "../registry.ts";
import type { Transformer } from "../types.ts";

export const bigIntTransformer: Transformer<bigint, { bigint: string }> = {
  encoder: {
    filter: { bigint: true },
    handler: ({ value }) => [
      TypeIdRegistry.BigInt,
      { bigint: value.toString() },
    ],
  },
  decoder: {
    filter: TypeIdRegistry.BigInt,
    handler: ({ value }) => BigInt(value.bigint),
  },
};
