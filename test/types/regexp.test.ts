import { test } from "bun:test";
import { Jasone } from "../../src/jasone.ts";
import { regExpType } from "../../src/types/regexp.ts";
import { expectEncodeDecode } from "./util.ts";

const jasone = new Jasone();

jasone.register(regExpType);

test("type: RegExp", () => {
  expectEncodeDecode(jasone, /[a-z]+/gi);
  expectEncodeDecode(jasone, /[a-z]\/+/gi);
  expectEncodeDecode(jasone, /[a-z]+\//);
});
