import { Jasone } from "../src/mod.ts";

const simple = Jasone.encode("simple text");
const complex = Jasone.encode({
  a: 1,
  b: 2,
  c: {
    d: "e",
    f: ["g", "h", ["i", [["j", "k"], { l: "m" }]]],
  },
  n: ["o", { p: null }],
});
const complexWithExtensions = Jasone.encode({
  a: 1,
  b: new Date("2022-01-01"),
  c: {
    d: "e",
    f: ["g", "h", new Set(["i", [["j", "k"], { l: "m" }]])],
  },
  n: ["o", { p: undefined }],
});

Deno.bench("decode: simple", () => {
  Jasone.decode(simple);
});

Deno.bench("decode: complex without extensions", () => {
  Jasone.decode(complex);
});

Deno.bench("decode: complex with extensions", () => {
  Jasone.decode(complexWithExtensions);
});
