import { SuperJSON } from "npm:superjson";
import { Jasone } from "jasone";

const simple = { success: true, result: { name: "John" }, error: undefined };

Deno.bench("simple: superjson", () => {
  SuperJSON.parse(SuperJSON.stringify(simple));
});

Deno.bench("simple: jasone", () => {
  Jasone.parse(Jasone.stringify(simple));
});

const complex = {
  string: "string",
  number: 420,
  undefined: undefined,
  date: new Date("2022-01-01"),
  set: new Set([1, 2, 3]),
  map: new Map([
    ["a", 1],
    ["b", 2],
  ]),
  array: [1, 2, 3],
  object: {
    a: 1,
    b: 2,
  },
  nested: [{ a: 1 }, null],
};

Deno.bench("complex: superjson", () => {
  SuperJSON.parse(SuperJSON.stringify(complex));
});

Deno.bench("complex: jasone", () => {
  Jasone.parse(Jasone.stringify(complex));
});
