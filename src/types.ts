/**
 * A JSON-compatible value.
 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

/**
 * The id of an encoded type to identify it on decoding.
 */
export type TypeId = string | number;

/**
 * A function that is responsible to encode a type into a JSON-compatible value.
 *
 * @param value The value to encode.
 * @param encode A function that works exactly the same as `Jasone.encode` useful
 *               to encode values recursively. This function comes from the instance
 *               where the type transformer is registered, so it has the same types.
 * @returns A JSON-compatible value.
 */
export type TypeEncoder<
  TType = unknown,
  TJson extends Record<string, JsonValue> = Record<string, JsonValue>,
> = (value: TType, encode: <T = unknown>(value: T) => JsonValue) => TJson;

/**
 * A function that is responsible to decode a type back to its decoded value.
 *
 * @param value The value to decode.
 * @param encode A function that works exactly the same as `Jasone.decode` useful
 *               to decode values recursively. This function comes from the instance
 *               where the type transformer is registered, so it has the same types.
 * @returns A JSON-compatible value.
 */
export type TypeDecoder<
  TType = unknown,
  TJson extends Record<string, JsonValue> = Record<string, JsonValue>,
> = (value: TJson, decode: <T = unknown>(value: JsonValue) => T) => TType;

export type MatchesFn<TType = unknown> = (value: unknown) => value is TType;

export type ClassLike<TInstance> = new (...args: unknown[]) => TInstance;

const typeOf = typeof undefined;
export type TypeOf = typeof typeOf;
