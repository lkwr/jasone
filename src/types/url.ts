import { createType } from "../transformer.ts";

export const urlType = createType({
  matches: (value) => value instanceof URL,
  typeId: 6,
  encode: (url) => ({
    url: url.toString(),
  }),
  decode: ({ url }) => new URL(url),
});
