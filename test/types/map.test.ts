import { test } from "bun:test";
import { Jasone } from "../../src/jasone.ts";
import { mapType } from "../../src/types/map.ts";
import { expectEncodeDecode } from "./util.ts";

const jasone = new Jasone();

jasone.register(mapType);

test("type: Map", () => {
  expectEncodeDecode(
    jasone,
    new Map([
      [1, 2],
      [3, 4],
    ]),
  );
  expectEncodeDecode(jasone, new Map([[1, new Map([[2, 3]])]]));
});
