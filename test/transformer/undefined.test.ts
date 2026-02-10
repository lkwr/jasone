import { test } from "bun:test";
import { Jasone } from "../../src/jasone.ts";
import { undefinedTransformer } from "../../src/transformers/undefined.ts";
import { expectEncodeDecode } from "./util.ts";

const jasone = new Jasone();

jasone.register(undefinedTransformer);

test("type: undefined", () => {
  expectEncodeDecode(jasone, undefined);
});
