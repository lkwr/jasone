import { createType } from "../transformer.ts";

export const setType = createType({
  matches: (value) => value instanceof Set,
  typeId: 4,
  encode: (set, encode) => ({
    set: Array.from(set.values().map((value) => encode(value))),
  }),
  decode: ({ set }, decode) => new Set(set.map((value) => decode(value))),
});
