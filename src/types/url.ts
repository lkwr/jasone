import { createType } from "../transformer.ts";

export const urlType = createType({
  target: URL,
  typeId: 6,
  encode: (url) => ({
    url: url.toString(),
  }),
  decode: ({ url }) => new URL(url),
});
