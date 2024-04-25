import type { TaggedJson } from "./types.ts";

export abstract class JasoneCodec {
  abstract encode<T>(value: T): TaggedJson<T>;
  abstract decode<T>(value: TaggedJson<T>): T;

  abstract stringify<T>(value: T): string;
  abstract parse<T>(value: string): T;
}
