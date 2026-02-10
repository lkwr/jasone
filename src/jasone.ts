import {
  DuplicatedTypeIdError,
  IllegalEncoderResultError,
  NonJsonValueError,
  UnhandledValueError,
  UnknownTypeIdError,
} from "./error.ts";
import { builtInTransformers } from "./transformers/index.ts";
import {
  type ClassLike,
  type Context,
  type Decoder,
  type Encoder,
  type JsonValue,
  type NonJsonType,
  nonJsonTypes,
  type Transformer,
  type TypeId,
} from "./types.ts";
import { matchDecoderFilters, matchEncoderFilters } from "./utils.ts";

/**
 * Jasone options that can be passed to the Jasone constructor.
 */
export type JasoneOptions = {
  /**
   * The type identifier that is used to determine if an object is a typed object.
   *
   * @default "$"
   */
  typeIdentifier?: string;

  /**
   * The type transformers that are used to encode and decode types.
   *
   * If not provided, no transformers are used. So if you want to use the built-in transformers,
   * you need to include them in the transformers array.
   *
   * @example
   * ```ts
   * // your custom transformer WITH built-in type transformers
   * const jasone = new Jasone({ transformers: [myCustomTransformer, ...builtInTransformers] });
   *
   * // your custom transformer WITHOUT built-in type transformers
   * const jasone = new Jasone({ transformers: [myCustomTransformer] });
   * ```
   */
  transformers?: Transformer<any, any, any>[];
};

/**
 * Jasone is a JSON encoder and decoder that can handle custom types.
 *
 * It exposes the default Jasone instance as `Jasone.default` and also
 * registers the methods as static methods on the class itself, so you
 * can easily use them without having to create an instance.
 *
 * ```ts
 * const encoded = Jasone.encode(value);
 * const decoded = Jasone.decode(value);
 * ```
 *
 * If you want to use your own types, you can either register them on any
 * instance (even on `Jasone.default`) or instantiate your own Jasone instance
 * and provide your custom transformers in the constructor.
 *
 * ```ts
 * // use your own transformer without the built-in transformers (Date, BigInt, Map, etc.)
 * const myInstance = new Jasone({
 *   transformers: [myCustomTransformer]
 * });
 *
 * // or use your own transformer with the built-in transformers (recommend)
 * const myInstance = new Jasone({
 *   transformers: [myCustomTransformer, ...builtInTransformers],
 * });
 *
 * const encoded = myInstance.encode(value);
 * const decoded = myInstance.decode(value);
 * ```
 */
export class Jasone {
  #typeIdentifier: string;

  #anyDecoder: Decoder[] = [];
  #typeIdDecoder: Map<TypeId, Decoder> = new Map();

  #anyEncoder: Encoder[] = [];
  #classEncoder: Map<ClassLike<any>, Encoder[]> = new Map();
  #customEncoder: Record<keyof NonJsonType, Encoder[]> = {
    bigint: [],
    function: [],
    object: [],
    symbol: [],
    undefined: [],
  };

  constructor(options: JasoneOptions = {}) {
    this.#typeIdentifier = options.typeIdentifier ?? "$";

    for (const transformer of options.transformers ?? [])
      this.register(transformer);
  }

  /**
   * The type identifier that is used to determine if an object is a typed object.
   */
  get typeIdentifier() {
    return this.#typeIdentifier;
  }

  /**
   * Register a new encoder to this Jasone instance.
   *
   * @param encoder The encoder to register.
   */
  registerEncoder<
    TType,
    TJson extends JsonValue,
    TContext extends Context = Context,
  >(encoder: Encoder<TType, TJson, TContext>): void {
    const filters = encoder.filter
      ? Array.isArray(encoder.filter)
        ? encoder.filter
        : [encoder.filter]
      : [];

    if (filters.length === 0) this.#anyEncoder.push(encoder as Encoder);

    for (const filter of filters) {
      // any handler
      if (filter.any) this.#anyEncoder.push(encoder as Encoder);

      // class constructor handler
      if (filter.class) {
        let classList = this.#classEncoder.get(filter.class);
        if (!classList) {
          classList = [];
          this.#classEncoder.set(filter.class, classList);
        }

        classList.push(encoder as Encoder);
      }

      // typeof fields handler
      for (const field of Object.keys(filter)) {
        if (
          nonJsonTypes.includes(field as keyof NonJsonType) &&
          filter[field as keyof NonJsonType]
        ) {
          this.#customEncoder[field as keyof NonJsonType].push(
            encoder as Encoder,
          );
        }
      }
    }
  }

  /**
   * Register a new decoder to this Jasone instance.
   *
   * @param decoder The decoder to register.
   */
  registerDecoder<
    TType,
    TJson extends Record<string, JsonValue>,
    TContext extends Context = Context,
  >(decoder: Decoder<TType, TJson, TContext>): void {
    const filters = decoder.filter
      ? Array.isArray(decoder.filter)
        ? decoder.filter
        : [decoder.filter]
      : [];

    if (filters.length === 0) this.#anyDecoder.push(decoder as Decoder);

    for (const filter of filters) {
      // any handler
      if (typeof filter === "function") {
        this.#anyDecoder.push(decoder as Decoder);
        continue;
      }

      if (this.#typeIdDecoder.has(filter))
        throw new DuplicatedTypeIdError(filter, decoder as Decoder);

      this.#typeIdDecoder.set(filter, decoder as Decoder);
    }
  }

  /**
   * Register a new transformer (decoder and encoder) to this Jasone instance.
   *
   * @param transformer The transformer to register.
   */
  register<TType, TJson extends JsonValue, TContext extends Context = Context>(
    transformer: Transformer<TType, TJson, TContext>,
  ): void {
    if (transformer.encoder)
      this.registerEncoder(transformer.encoder as Encoder);
    if (transformer.decoder)
      this.registerDecoder(transformer.decoder as Decoder);
  }

  /**
   * Encode an arbitrary value to a JSON-compatible Jasone encoded value.
   *
   * @param value The value to encode.
   * @param context An optional arbitrary object that is passed to all encoders.
   * @returns A JSON-compatible Jasone encoded value.
   */
  encode(value: unknown, context: Context = {}): JsonValue {
    const type = typeof value;

    switch (type) {
      case "boolean":
      case "number":
      case "string":
        return value as JsonValue;

      case "object":
        // null
        if (value === null) return null;

        // array
        if (Array.isArray(value))
          return value.map((entry) => this.encode(entry, context));

        // raw object
        if (Object.getPrototypeOf(value) === Object.prototype) {
          const encodedObject = Object.fromEntries(
            Object.entries(value as Record<string, JsonValue>).map(
              ([key, inner]) => [key, this.encode(inner, context)],
            ),
          );

          // in case a type identifier is present, we need to escape it
          if (this.#typeIdentifier in encodedObject) {
            encodedObject[this.#typeIdentifier] = [
              encodedObject[this.#typeIdentifier] as JsonValue,
            ];
          }

          return encodedObject;
        }
    }

    let encoder: Encoder | undefined;

    if (type === "object")
      encoder ??= this.#classEncoder
        .get((value as object).constructor as ClassLike<unknown>)
        ?.find((inner) =>
          matchEncoderFilters(inner.filter, value, this, context),
        );

    encoder ??= this.#customEncoder[type].find((inner) =>
      matchEncoderFilters(inner.filter, value, this, context),
    );

    encoder ??= this.#anyEncoder.find((inner) =>
      matchEncoderFilters(inner.filter, value, this, context),
    );

    if (!encoder) throw new UnhandledValueError(value);

    const [typeId, result] = encoder.handler({ value, jasone: this, context });

    if (typeId !== null && this.#typeIdentifier in result)
      throw new IllegalEncoderResultError(result);

    return typeId === null
      ? result
      : { [this.#typeIdentifier]: typeId, ...result };
  }

  /**
   * Decode an Jasone encoded value to its decoded value.
   *
   * @param value The Jasone encoded value to decode.
   * @param context An optional arbitrary object that is passed to all decoders.
   * @returns The decoded value.
   */
  decode<T = unknown>(value: JsonValue, context: Context = {}): T {
    return this.#decode(value, context) as T;
  }

  #decode(
    value: JsonValue,
    context: Context,
    ignoreTypeIdentifier = false,
  ): unknown {
    switch (typeof value) {
      case "boolean":
      case "number":
      case "string":
        return value;
      case "object":
        // null
        if (value === null) return null;

        // raw array
        if (Array.isArray(value))
          return value.map((inner) => this.#decode(inner, context));

        // typed objects
        if (
          this.#typeIdentifier in value &&
          !Array.isArray(value) &&
          !ignoreTypeIdentifier
        ) {
          const typeId = value[this.#typeIdentifier] as TypeId | [JsonValue];

          // if the type identifier is an array, its an escaped object
          if (Array.isArray(typeId)) {
            const [escaped] = typeId;
            const cloned = { ...value };

            cloned[this.#typeIdentifier] = escaped;

            return this.#decode(cloned, context, true);
          }

          let decoder: Decoder | undefined;

          decoder ??= this.#typeIdDecoder.get(typeId);

          decoder ??= this.#anyDecoder.find((entry) =>
            matchDecoderFilters(entry.filter, value, typeId, this, context),
          );

          if (!decoder) throw new UnknownTypeIdError(typeId, value);

          return decoder.handler({ typeId, value, jasone: this, context });
        }

        // raw object
        if (Object.getPrototypeOf(value) === Object.prototype)
          return Object.fromEntries(
            Object.entries(value).map(([key, inner]) => [
              key,
              this.#decode(inner, context),
            ]),
          );

        break;
    }

    throw new NonJsonValueError(value);
  }

  /**
   * Alias for {@link Jasone.prototype.encode}.
   */
  serialize(value: unknown, context: Context = {}): JsonValue {
    return this.encode(value, context);
  }

  /**
   * Alias for {@link Jasone.prototype.decode}.
   */
  deserialize<T = unknown>(value: JsonValue, context: Context = {}): T {
    return this.decode<T>(value, context);
  }

  /**
   * A wrapper around {@link JSON.stringify} that encodes a value and stringifies it.
   *
   * Under the hood, this functions looks like this:
   *
   * ```ts
   * JSON.stringify(this.encode(value));
   * ```
   */
  stringify(value: unknown, context: Context = {}): string {
    return JSON.stringify(this.encode(value, context));
  }

  /**
   * A wrapper around {@link JSON.parse} that parses a Jasone encoded value and decodes it.
   *
   * Under the hood, this functions looks like this:
   *
   * ```ts
   * this.decode(JSON.parse(value));
   * ```
   */
  parse<T = unknown>(value: string, context: Context = {}): T {
    return this.decode<T>(JSON.parse(value), context);
  }

  // -----------------------------------------------------------------------------
  // -                      Static Methods for convenience                       -
  // -----------------------------------------------------------------------------

  /**
   * The default Jasone instance with the default types already registered.
   */
  static default = new Jasone({
    transformers: builtInTransformers,
  });
  static registerEncoder = Jasone.default.registerEncoder.bind(Jasone.default);
  static registerDecoder = Jasone.default.registerDecoder.bind(Jasone.default);
  static register = Jasone.default.register.bind(Jasone.default);
  static encode = Jasone.default.encode.bind(Jasone.default);
  static serialize = Jasone.default.serialize.bind(Jasone.default);
  static decode = Jasone.default.decode.bind(Jasone.default);
  static deserialize = Jasone.default.deserialize.bind(Jasone.default);
  static stringify = Jasone.default.stringify.bind(Jasone.default);
  static parse = Jasone.default.parse.bind(Jasone.default);
}

export const registerEncoder = Jasone.registerEncoder;
export const registerDecoder = Jasone.registerDecoder;
export const register = Jasone.register;
export const encode = Jasone.encode;
export const serialize = Jasone.serialize;
export const decode = Jasone.decode;
export const deserialize = Jasone.deserialize;
export const stringify = Jasone.stringify;
export const parse = Jasone.parse;
