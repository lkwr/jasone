import type { ClassLike } from "../dist/index.d.cts";
import type { TypeTransformer } from "./transformer.ts";
import type {
  JsonValue,
  MatchesFn,
  TypeDecoder,
  TypeEncoder,
  TypeId,
} from "./types.ts";

export type JasoneOptions = {
  typeIdentifier?: string;
  valueIdentifier?: string;
  types?: TypeTransformer<unknown, Record<string, JsonValue>>[];
};

export class Jasone {
  #typeIdentifier: string;
  #valueIdentifier: string;

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
    this.#valueIdentifier = options.valueIdentifier ?? "@";
    for (const type of options.types ?? []) this.register(type);
  }

  register<TType, TJson extends JsonValue>(
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

          // in case a type identifier is present, we need to escape the object
          if (this.#typeIdentifier in result) {
            return {
              [this.#typeIdentifier]: null,
              [this.#valueIdentifier]: result,
            };
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

    if (
      typeof encoded === "object" &&
      encoded !== null &&
      !Array.isArray(encoded)
    ) {
      return { [this.#typeIdentifier]: encoder.typeId, ...encoded };
    }

    return {
      [this.#typeIdentifier]: encoder.typeId,
      [this.#valueIdentifier]: encoded,
    };
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
          const typeId = value[this.#typeIdentifier] as TypeId | null;

          // if the type identifier is null, its an escaped object
          if (typeId === null) {
            if (!(this.#valueIdentifier in value))
              throw new Error(
                "Illegal value received. Missing value indentifier",
                {
                  cause: value,
                },
              );

            return this.#decode(
              value[this.#valueIdentifier] as JsonValue,
              true,
            );
          }

          const decoder = this.#decoder.get(typeId);
          if (!decoder)
            throw new Error(`No decoder found for type id: ${typeId}`, {
              cause: value,
            });
          return decoder(
            (this.#valueIdentifier in value
              ? value[this.#valueIdentifier]
              : value) as JsonValue,
            this.decode.bind(this),
          );
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
}
