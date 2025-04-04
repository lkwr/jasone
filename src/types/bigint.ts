import { createType } from "../transformer.ts";

export const bigIntType = createType({
  matches: (value) => typeof value === "bigint",
  typeId: 2,
  encode: (bigint) => ({ bigint: bigint.toString() }),
  decode: ({ bigint }) => BigInt(bigint),
});
