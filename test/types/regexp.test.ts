import { test } from "bun:test";
import { Jasone } from "../../src/jasone.ts";
import { regExpTransformer } from "../../src/transformers/regexp.ts";
import { expectEncodeDecode } from "./util.ts";

const jasone = new Jasone();

jasone.register(regExpTransformer);

test("type: RegExp", () => {
  expectEncodeDecode(jasone, /[a-z]+/gi);
  expectEncodeDecode(jasone, /[a-z]\/+/gi);
  expectEncodeDecode(jasone, /[a-z]+\//);
});
