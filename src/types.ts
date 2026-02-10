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

export type Context = Record<PropertyKey, unknown>;

export type EncodeFilter<TType, TContext extends Context = Context> = {
  class?: ClassLike<TType>;
  any?: (options: EncodeOptions<unknown, TContext>) => boolean;
} & {
  [Key in keyof NonJsonType]?:
    | ((options: EncodeOptions<NonJsonType[Key], TContext>) => boolean)
    | boolean;
};

export type EncodeHandler<
  TType,
  TJson extends JsonValue,
  TContext extends Context = Context,
> = (ctx: EncodeOptions<TType, TContext>) => EncodeResult<TJson>;

export type EncodeOptions<TType, TContext extends Context = Context> = {
  value: TType;
  jasone: Jasone;
  context: TContext;
};

export type EncodeResult<TJson extends JsonValue> =
  TJson extends Record<string, JsonValue>
    ? [TypeId, TJson] | [null, JsonValue]
    : [null, JsonValue];

export type Encoder<
  TType = unknown,
  TJson extends JsonValue = JsonValue,
  TContext extends Context = Context,
> = {
  filter?: EncodeFilter<TType, TContext> | EncodeFilter<TType, TContext>[];
  handler: EncodeHandler<TType, TJson, TContext>;
};

export type DecodeFilter<TContext extends Context = Context> =
  | TypeId
  | ((options: DecodeOptions<Record<string, JsonValue>, TContext>) => boolean);

export type DecodeOptions<
  TJson extends Record<string, JsonValue>,
  TContext extends Context = Context,
> = {
  value: TJson;
  typeId: TypeId;
  jasone: Jasone;
  context: TContext;
};

export type DecodeHandler<
  TType,
  TJson extends Record<string, JsonValue>,
  TContext extends Context = Context,
> = (ctx: DecodeOptions<TJson, TContext>) => TType;

export type Decoder<
  TType = unknown,
  TJson extends Record<string, JsonValue> = Record<string, JsonValue>,
  TContext extends Context = Context,
> = {
  filter?: DecodeFilter<TContext> | DecodeFilter<TContext>[];
  handler: DecodeHandler<TType, TJson, TContext>;
};

export type Transformer<
  TType = unknown,
  TJson extends JsonValue = JsonValue,
  TContext extends Context = Context,
> = {
  encoder?: Encoder<TType, TJson, TContext>;
  decoder?: TJson extends Record<string, JsonValue>
    ? Decoder<TType, TJson, TContext>
    : never;
};
