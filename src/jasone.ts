import type { TypeTransformer } from "./transformer.ts";
import type {
  ClassLike,
  JsonValue,
  MatchesFn,
  TypeDecoder,
  TypeEncoder,
  TypeId,
} from "./types.ts";
import * as types from "./types/index.ts";

export type JasoneOptions = {
  typeIdentifier?: string;
  types?: TypeTransformer<any, any>[];
};

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

  // -----------------------------------------------------------------------------
  // -                      Static Methods for convenience                       -
  // -----------------------------------------------------------------------------

  static default = new Jasone({
    types: Object.values(types),
  });

  static register = Jasone.default.register.bind(Jasone.default);

  static encode = Jasone.default.encode.bind(Jasone.default);

  static decode = Jasone.default.decode.bind(Jasone.default);
}
