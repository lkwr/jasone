import type { TypeTransformer } from "./transformer.ts";
import type {
  ClassLike,
  JsonValue,
  MatchesFn,
  TypeDecoder,
  TypeEncoder,
  TypeId,
} from "./types.ts";
import { defaultTypes } from "./types/index.ts";

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
   * The types that are used to encode and decode objects.
   *
   * If not provided, the default types are used. By providing your own types,
   * the default types are not used anymore, so be sure to also include them.
   *
   * @example
   * ```ts
   * // your custom type WITH default types
   * const jasone = new Jasone({ types: [myCustomType, ...defaultTypes] });
   *
   * // your custom type WITHOUT default types
   * const jasone = new Jasone({ types: [myCustomType] });
   * ```
   */
  types?: TypeTransformer<any, any>[];
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
 * const myInstance = new Jasone({ types: [myCustomType] });
 *
 * // or use our own types with the default types (recommend)
 * const myInstance = new Jasone({ types: [myCustomType, ...defaultTypes] });
 *
 * const encoded = myInstance.encode(value);
 * const decoded = myInstance.decode(value);
 * ```
 */
export class Jasone {
  #typeIdentifier: string;

  #decoder: Map<TypeId, TypeDecoder> = new Map();

  #classEncoder: Map<
    ClassLike<unknown>,
    { typeId: TypeId; encode: TypeEncoder }
  > = new Map();
  #matchEncoder: Array<{
    matches: MatchesFn;
    typeId: TypeId;
    encode: TypeEncoder;
  }> = [];

  constructor(options: JasoneOptions = {}) {
    this.#typeIdentifier = options.typeIdentifier ?? "$";
    for (const type of options.types ?? []) this.register(type);
  }

  /**
   * Register a new type to this Jasone instance.
   *
   * @param type The type to register.
   */
  register<TType, TJson extends Record<string, JsonValue>>(
    type: TypeTransformer<TType, TJson>,
  ) {
    this.#decoder.set(type.typeId, type.decode as TypeDecoder);

    if ("matches" in type) {
      this.#matchEncoder.push({
        matches: type.matches,
        typeId: type.typeId,
        encode: type.encode as TypeEncoder,
      });
    } else {
      this.#classEncoder.set(type.target, {
        typeId: type.typeId,
        encode: type.encode as TypeEncoder,
      });
    }
  }

  /**
   * Encode an arbitrary value to a JSON-compatible Jasone encoded value.
   *
   * @param value The value to encode.
   * @returns A JSON-compatible Jasone encoded value.
   */
  encode(value: unknown): JsonValue {
    switch (typeof value) {
      case "string":
      case "number":
      case "boolean":
        return value;
      case "object":
        // null
        if (value === null) return null;

        // raw array
        if (Array.isArray(value))
          return value.map((inner) => this.encode(inner));

        // raw object
        if (Object.getPrototypeOf(value) === Object.prototype) {
          const result = Object.fromEntries(
            Object.entries(value).map(([key, inner]) => [
              key,
              this.encode(inner),
            ]),
          );

          // in case a type identifier is present, we need to escape it
          if (this.#typeIdentifier in result) {
            result[this.#typeIdentifier] = [
              this.encode(result[this.#typeIdentifier]),
            ];
          }

          return result;
        }
    }

    let encoder: { typeId: TypeId; encode: TypeEncoder<unknown> } | undefined =
      undefined;

    if (typeof value === "object" && value !== null)
      encoder = this.#classEncoder.get(value.constructor as ClassLike<unknown>);

    if (!encoder)
      encoder = this.#matchEncoder.find(({ matches }) => matches(value));

    if (!encoder) throw new Error("No encoder found.", { cause: value });

    const encoded = encoder.encode(value, this.encode.bind(this));

    return { [this.#typeIdentifier]: encoder.typeId, ...encoded };
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

  #decode(value: JsonValue, shouldEscape = false): unknown {
    switch (typeof value) {
      case "string":
      case "number":
      case "boolean":
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
          !shouldEscape
        ) {
          const typeId = value[this.#typeIdentifier] as TypeId | [JsonValue];

          // if the type identifier is an array, its an escaped object
          if (Array.isArray(typeId)) {
            if (typeId.length !== 1)
              throw new Error(
                "Illegal value received. Escaped type identifiers must have exactly one element.",
                { cause: value },
              );

            const [escaped] = typeId;
            const cloned = { ...value };

            cloned[this.#typeIdentifier] = escaped;

            return this.#decode(cloned, true);
          }

          const decoder = this.#decoder.get(typeId);
          if (!decoder)
            throw new Error(`No decoder found for type id: ${typeId}`, {
              cause: value,
            });
          return decoder(value, this.decode.bind(this));
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

    throw new Error("Illegal value received.", {
      cause: value,
    });
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
    types: defaultTypes,
  });

  /**
   * Register a new type to the default Jasone instance.
   *
   * @param type The type to register.
   */
  static register = Jasone.default.register.bind(Jasone.default);

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
}
