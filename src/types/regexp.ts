import { createType } from "../transformer.ts";

export const regExpType = createType({
  target: RegExp,
  typeId: 3,
  encode: (regExp) => ({ source: regExp.source, flags: regExp.flags }),
  decode: ({ source, flags }) => new RegExp(source, flags),
});
