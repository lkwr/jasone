import { assertEquals } from "@std/assert";
import { Jasone } from "@jasone/core";
import { processData } from "./utils.ts";

Deno.test("object: empty", () => {
  assertEquals({}, processData({}, Jasone));
});

Deno.test("object: simple", () => {
  assertEquals({ a: 1, b: 2 }, processData({ a: 1, b: 2 }, Jasone));
});

Deno.test("object: nested", () => {
  assertEquals(
    { a: { b: 1, c: 2 }, d: { e: 3, f: 4 } },
    processData({ a: { b: 1, c: 2 }, d: { e: 3, f: 4 } }, Jasone)
  );
});
