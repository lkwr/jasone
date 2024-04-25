import { assertEquals } from "@std/assert";
import { Jasone } from "@jasone/core";
import { processData } from "./utils.ts";

Deno.test("primitive: string", () => {
  assertEquals("Hello World!", processData("Hello World!", Jasone));
  assertEquals("", processData("", Jasone));
  assertEquals("\n", processData("\n", Jasone));
});

Deno.test("primitive: number", () => {
  assertEquals(0, processData(0, Jasone));
  assertEquals(-20, processData(-20, Jasone));
  assertEquals(5.5, processData(5.5, Jasone));
});

Deno.test("primitive: boolean", () => {
  assertEquals(true, processData(true, Jasone));
  assertEquals(false, processData(false, Jasone));
});

Deno.test("primitive: null", () => {
  assertEquals(null, processData(null, Jasone));
});
