import { assertEquals } from "@std/assert";

import { Jasone } from "../src/mod.ts";
import { processData } from "./utils.ts";

Deno.test("extension: undefined", () => {
  assertEquals(undefined, processData(undefined, Jasone));
});

Deno.test("extension: bigint", () => {
  assertEquals(BigInt(10), processData(BigInt(10), Jasone));
});

Deno.test("extension: date", () => {
  assertEquals(new Date("2022-01-01"), processData(new Date("2022-01-01"), Jasone));
  assertEquals(new Date(40000), processData(new Date(40000), Jasone));
});

Deno.test("extension: regexp", () => {
  assertEquals(/a/g, processData(/a/g, Jasone));
});

Deno.test("extension: set", () => {
  assertEquals(new Set([1, 2, 3]), processData(new Set([1, 2, 3]), Jasone));
  assertEquals(
    new Set<unknown>([1, 2, "3"]),
    processData(new Set<unknown>([1, 2, "3"]), Jasone)
  );
});

Deno.test("extension: map", () => {
  assertEquals(
    new Map([
      ["a", 1],
      ["b", 2],
    ]),
    processData(
      new Map([
        ["a", 1],
        ["b", 2],
      ]),
      Jasone
    )
  );
  assertEquals(
    new Map<unknown, unknown>([
      ["a", "1"],
      ["b", false],
    ]),
    processData(
      new Map<unknown, unknown>([
        ["a", "1"],
        ["b", false],
      ]),
      Jasone
    )
  );
});

Deno.test("extension: error", () => {
  const simpleError = new Error("simple");
  const complexError = new Error("complex", { cause: simpleError });

  assertEquals(simpleError, processData(simpleError, Jasone));
  assertEquals(complexError, processData(complexError, Jasone));
});

Deno.test("extension: url", () => {
  assertEquals(
    new URL("https://user:pass@example.com/path"),
    processData(new URL("https://user:pass@example.com/path"), Jasone)
  );
});
