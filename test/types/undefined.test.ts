import { test } from "bun:test";
import { Jasone } from "../../src/jasone.ts";
import { undefinedType } from "../../src/types/undefined.ts";
import { expectEncodeDecode } from "./util.ts";

const jasone = new Jasone();

jasone.register(undefinedType);

test("type: undefined", () => {
  expectEncodeDecode(jasone, undefined);
});
