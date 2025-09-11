import { test } from "bun:test";
import { Jasone } from "../../src/jasone.ts";
import { urlTransformer } from "../../src/transformers/url.ts";
import { expectEncodeDecode } from "./util.ts";

const jasone = new Jasone();

jasone.register(urlTransformer);

test("type: URL", () => {
  expectEncodeDecode(jasone, new URL("https://example.com"));
  expectEncodeDecode(jasone, new URL("https://example.com/path"));
  expectEncodeDecode(
    jasone,
    new URL("protocol://username:password@example.com/path?query#fragment"),
  );
});
