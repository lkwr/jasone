import { Jasone } from "../packages/core/src/main.ts";

const simple = "simple text";
const complex = {
  a: 1,
  b: 2,
  c: {
    d: "e",
    f: ["g", "h", ["i", [["j", "k"], { l: "m" }]]],
  },
  n: ["o", { p: null }],
};
const complexWithExtensions = {
  a: 1,
  b: new Date("2022-01-01"),
  c: {
    d: "e",
    f: ["g", "h", new Set(["i", [["j", "k"], { l: "m" }]])],
  },
  n: ["o", { p: undefined }],
};

Deno.bench("encode: simple", () => {
  Jasone.encode(simple);
});

Deno.bench("encode: complex without extensions", () => {
  Jasone.encode(complex);
});

Deno.bench("encode: complex with extensions", () => {
  Jasone.encode(complexWithExtensions);
});
