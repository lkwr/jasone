import { JasoneCodec } from "../jasone.ts";
import { JsonValue, Tag } from "../types.ts";

export type ExtensionContext = {
  readonly tag: Tag;
  readonly instance: JasoneCodec;
};

// deno-lint-ignore no-explicit-any
export type Extension<T = any, V extends JsonValue = any> = {
  check: (value: unknown, ctx: ExtensionContext) => value is T;
  encode: (value: T, ctx: ExtensionContext) => V;
  decode: (value: V, ctx: ExtensionContext) => T;
};
