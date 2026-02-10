import { test } from "bun:test";
import { Jasone } from "../../src/jasone.ts";
import { bigIntTransformer } from "../../src/transformers/bigint.ts";
import { expectEncodeDecode } from "./util.ts";

const jasone = new Jasone();

jasone.register(bigIntTransformer);

test("type: BigInt", () => {
  expectEncodeDecode(jasone, -10n);
  expectEncodeDecode(jasone, 100_000_000_000_000_000_000_000_000_000_001n);
});
