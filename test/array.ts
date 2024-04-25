import { assertEquals } from "@std/assert";
import { Jasone } from "@jasone/core";
import { processData } from "./utils.ts";

Deno.test("array: empty", () => {
  assertEquals([], processData([], Jasone));
});

Deno.test("array: simple", () => {
  assertEquals([1, "2", false], processData([1, "2", false], Jasone));
});

Deno.test("array: nested", () => {
  assertEquals([1, [2, 3], "test"], processData([1, [2, 3], "test"], Jasone));
});
