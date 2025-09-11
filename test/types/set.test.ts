import { test } from "bun:test";
import { Jasone } from "../../src/jasone.ts";
import { setTransformer } from "../../src/transformers/set.ts";
import { expectEncodeDecode } from "./util.ts";

const jasone = new Jasone();

jasone.register(setTransformer);

test("type: Set", () => {
  expectEncodeDecode(jasone, new Set([1, 2, 3]));
  expectEncodeDecode(jasone, new Set([1, new Set([2, 3])]));
});
