import {
  DuplicatedTypeIdError,
  IllegalEncoderResultError,
  NonJsonValueError,
  UnhandledValueError,
  UnknownTypeIdError,
} from "./error.ts";
import { defaultTransformers } from "./transformers/index.ts";
import {
  type ClassLike,
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
   * The type transformers that are used to transform types.
   *
   * If not provided, the default transformers are used. By providing your own transformers,
   * the default transformers are not used anymore, so be sure to also include them if needed.
   *
   * @example
   * ```ts
   * // your custom transformer WITH default type transformers
   * const jasone = new Jasone({ types: [myCustomTransformer, ...defaultTransformers] });
   *
   * // your custom transformer WITHOUT default type transformers
   * const jasone = new Jasone({ types: [myCustomTransformer] });
   * ```
   */
  types?: Transformer<any, any>[];
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
 * instance (even on `Jasone.default`) or instantiate your own Jasone instance.
 *
 * ```ts
 * // use our own types without the default types (Date, BigInt, Map, etc.)
 * const myInstance = new Jasone({
 *   types: [myCustomTransformer]
 * });
 *
 * // or use our own types with the default types (recommend)
 * const myInstance = new Jasone({
 *   types: [myCustomTransformer, ...defaultTransformers],
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

    for (const transformer of options.types ?? []) this.register(transformer);
  }

  #registerEncoder<TType, TJson extends JsonValue>(
    encoder: Encoder<TType, TJson>,
  ) {
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

  #registerDecoder<TType, TJson extends Record<string, JsonValue>>(
    decoder: Decoder<TType, TJson>,
  ) {
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
   * Register a new type to this Jasone instance.
   *
   * @param type The type to register.
   */
  register<TType, TJson extends JsonValue>(
    transformer: Transformer<TType, TJson>,
  ) {
    if (transformer.encoder)
      this.#registerEncoder(transformer.encoder as Encoder);
    if (transformer.decoder)
      this.#registerDecoder(transformer.decoder as Decoder);
  }

  /**
   * Encode an arbitrary value to a JSON-compatible Jasone encoded value.
   *
   * @param value The value to encode.
   * @returns A JSON-compatible Jasone encoded value.
   */
  encode(value: unknown): JsonValue {
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
          return value.map((entry) => this.encode(entry));

        // raw object
        if (Object.getPrototypeOf(value) === Object.prototype) {
          const encodedObject = Object.fromEntries(
            Object.entries(value as Record<string, JsonValue>).map(
              ([key, inner]) => [key, this.encode(inner)],
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
        ?.find((inner) => matchEncoderFilters(inner.filter, value));

    encoder ??= this.#customEncoder[type].find((inner) =>
      matchEncoderFilters(inner.filter, value),
    );

    encoder ??= this.#anyEncoder.find((inner) =>
      matchEncoderFilters(inner.filter, value),
    );

    if (!encoder) throw new UnhandledValueError(value);

    const [typeId, result] = encoder.handler({ value, jasone: this });

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
   * @returns The decoded value.
   */
  decode<T = unknown>(value: JsonValue): T {
    return this.#decode(value) as T;
  }

  #decode(value: JsonValue, ignoreTypeIdentifier = false): unknown {
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
          return value.map((inner) => this.#decode(inner));

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

            return this.#decode(cloned, true);
          }

          let decoder: Decoder | undefined;

          decoder ??= this.#typeIdDecoder.get(typeId);

          decoder ??= this.#anyDecoder.find((entry) =>
            matchDecoderFilters(entry.filter, value, typeId),
          );

          if (!decoder) throw new UnknownTypeIdError(typeId, value);

          return decoder.handler({ typeId, value, jasone: this });
        }

        // raw object
        if (Object.getPrototypeOf(value) === Object.prototype)
          return Object.fromEntries(
            Object.entries(value).map(([key, inner]) => [
              key,
              this.#decode(inner),
            ]),
          );

        break;
    }

    throw new NonJsonValueError(value);
  }

  /**
   * Alias for `encode`.
   */
  serialize(value: unknown): JsonValue {
    return this.encode(value);
  }

  /**
   * Alias for `decode`.
   */
  deserialize<T = unknown>(value: JsonValue): T {
    return this.decode<T>(value);
  }

  /**
   * A wrapper around `JSON.stringify` that encodes a value and stringifies it.
   *
   * Under the hood, this functions looks like this:
   *
   * ```ts
   * JSON.stringify(this.encode(value));
   * ```
   */
  stringify(value: unknown): string {
    return JSON.stringify(this.encode(value));
  }

  /**
   * A wrapper around `JSON.parse` that parses a Jasone encoded value and decodes it.
   *
   * Under the hood, this functions looks like this:
   *
   * ```ts
   * this.decode(JSON.parse(value));
   * ```
   */
  parse<T = unknown>(value: string): T {
    return this.decode<T>(JSON.parse(value));
  }

  // -----------------------------------------------------------------------------
  // -                      Static Methods for convenience                       -
  // -----------------------------------------------------------------------------

  /**
   * The default Jasone instance with the default types already registered.
   */
  static default = new Jasone({
    types: defaultTransformers,
  });

  /**
   * Register a new type to the default Jasone instance.
   *
   * @param type The type to register.
   */
  // static register = Jasone.default.register.bind(Jasone.default);

  /**
   * Encode an arbitrary value to a JSON-compatible Jasone encoded value.
   *
   * @param value The value to encode.
   * @returns A JSON-compatible Jasone encoded value.
   */
  static encode = Jasone.default.encode.bind(Jasone.default);

  /**
   * Alias for `encode`.
   */
  static serialize = Jasone.default.serialize.bind(Jasone.default);

  /**
   * Decode an Jasone encoded value to its decoded value.
   *
   * @param value The Jasone encoded value to decode.
   * @returns The decoded value.
   */
  static decode = Jasone.default.decode.bind(Jasone.default);

  /**
   * Alias for `decode`.
   */
  static deserialize = Jasone.default.deserialize.bind(Jasone.default);

  /**
   * A wrapper around `JSON.stringify` that encodes a value and stringifies it.
   *
   * Under the hood, this functions looks like this:
   *
   * ```ts
   * JSON.stringify(Jasone.encode(value));
   * ```
   */
  static stringify = Jasone.default.stringify.bind(Jasone.default);

  /**
   * A wrapper around `JSON.parse` that parses a Jasone encoded value and decodes it.
   *
   * Under the hood, this functions looks like this:
   *
   * ```ts
   * Jasone.decode(JSON.parse(value));
   * ```
   */
  static parse = Jasone.default.parse.bind(Jasone.default);

  /**
   * Register a new type to this Jasone instance.
   *
   * @param type The type to register.
   */
  static register = Jasone.default.register.bind(Jasone.default);
}
