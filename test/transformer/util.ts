import { expect } from "bun:test";
import type { Jasone } from "../../src/jasone.ts";

export const expectEncodeDecode = (jasone: Jasone, value: unknown) => {
  expect<unknown>(jasone.decode(jasone.encode(value))).toEqual(value);
};
