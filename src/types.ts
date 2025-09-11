import type { Jasone } from "./jasone.ts";

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

export type ClassLike<TInstance> = new (...args: any[]) => TInstance;

export const nonJsonTypes = [
  "bigint",
  "function",
  "object",
  "symbol",
  "undefined",
] satisfies readonly (keyof NonJsonType)[];

export type NonJsonType = {
  bigint: bigint;
  function: Function;
  object: object;
  symbol: symbol;
  undefined: undefined;
};

export type EncodeFilter<TType> = {
  class?: ClassLike<TType>;
  any?: (value: unknown) => boolean;
} & {
  [Key in keyof NonJsonType]?: ((value: NonJsonType[Key]) => boolean) | boolean;
};

export type EncodeHandler<TType, TJson extends JsonValue> = (
  ctx: EncodeContext<TType>,
) => EncodeResult<TJson>;

export type EncodeContext<TType> = {
  value: TType;
  jasone: Jasone;
};

export type EncodeResult<TJson extends JsonValue> = TJson extends Record<
  string,
  JsonValue
>
  ? [TypeId, TJson] | [null, JsonValue]
  : [null, JsonValue];

export type Encoder<TType = unknown, TJson extends JsonValue = JsonValue> = {
  filter?: EncodeFilter<TType> | EncodeFilter<TType>[];
  handler: EncodeHandler<TType, TJson>;
};

export type DecodeFilter =
  | TypeId
  | ((typeId: TypeId, value: Record<string, JsonValue>) => boolean);

export type DecodeContext<TJson extends Record<string, JsonValue>> = {
  value: TJson;
  typeId: TypeId;
  jasone: Jasone;
};

export type DecodeHandler<TType, TJson extends Record<string, JsonValue>> = (
  ctx: DecodeContext<TJson>,
) => TType;

export type Decoder<
  TType = unknown,
  TJson extends Record<string, JsonValue> = Record<string, JsonValue>,
> = {
  filter?: DecodeFilter | DecodeFilter[];
  handler: DecodeHandler<TType, TJson>;
};

export type Transformer<
  TType = unknown,
  TJson extends JsonValue = JsonValue,
> = {
  encoder?: Encoder<TType, TJson>;
  decoder?: TJson extends Record<string, JsonValue>
    ? Decoder<TType, TJson>
    : never;
};
