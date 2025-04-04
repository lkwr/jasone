import { createType } from "../transformer.ts";

export const dateType = createType({
  target: Date,
  typeId: 1,
  encode: (date) => ({ timestamp: date.getTime() }),
  decode: ({ timestamp }) => new Date(timestamp),
});
