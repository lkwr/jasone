import { test } from "bun:test";
import { Jasone } from "../../src/jasone.ts";
import { dateTransformer } from "../../src/transformers/date.ts";
import { expectEncodeDecode } from "./util.ts";

const jasone = new Jasone();

jasone.register(dateTransformer);

test("type: Date", () => {
  expectEncodeDecode(jasone, new Date(0));
  expectEncodeDecode(jasone, new Date(1));
  expectEncodeDecode(jasone, new Date("2000-01-01T00:00:00.000Z"));
  expectEncodeDecode(jasone, new Date());
});
