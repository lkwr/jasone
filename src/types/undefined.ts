import { createType } from "../transformer.ts";

export const undefinedType = createType({
  matches: (value) => value === undefined,
  typeId: 1,
  encode: () => ({}),
  decode: () => undefined,
});
