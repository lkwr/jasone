import { createType } from "../transformer.ts";

export const mapType = createType({
  matches: (value) => value instanceof Map,
  typeId: 5,
  encode: (map, encode) => ({
    map: Array.from(
      map.entries().map(([key, value]) => [encode(key), encode(value)]),
    ),
  }),
  decode: ({ map }, decode) =>
    new Map(
      map.map(([key, value]) => {
        if (key === undefined || value === undefined)
          throw new Error("Illegal value received.", { cause: map });
        return [decode(key), decode(value)];
      }),
    ),
});
