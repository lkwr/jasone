export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type TypeId = string | number;

export type TypeEncoder<
  TType = unknown,
  TJson extends Record<string, JsonValue> = Record<string, JsonValue>,
> = (value: TType, encode: <T = unknown>(value: T) => JsonValue) => TJson;

export type TypeDecoder<
  TType = unknown,
  TJson extends Record<string, JsonValue> = Record<string, JsonValue>,
> = (value: TJson, decode: <T = unknown>(value: JsonValue) => T) => TType;

export type MatchesFn<TType = unknown> = (value: unknown) => value is TType;

export type ClassLike<TInstance> = new (...args: unknown[]) => TInstance;

const typeOf = typeof undefined;
export type TypeOf = typeof typeOf;
