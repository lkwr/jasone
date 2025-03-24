import { createType } from "../transformer.ts";

export const dateType = createType({
  target: Date,
  typeId: 0,
  encode: (date) => date.getTime(),
  decode: (value) => new Date(value),
});
