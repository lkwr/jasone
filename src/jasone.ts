import { DecodeError } from "./error.ts";
import { Extension } from "./extension/extension.ts";
import {
  dateExtension,
  mapExtension,
  setExtension,
  undefinedExtension,
} from "./extension/common.ts";
import {
  JsonArray,
  JsonObject,
  JsonValue,
  Tag,
  TagArray,
  TagObject,
  TagValue,
  Tagged,
} from "./types.ts";

export class JasoneCodec {
  readonly extensions: Map<Tag, Extension>;

  constructor(extensions: Map<Tag, Extension> = new Map<Tag, Extension>()) {
    this.extensions = extensions;
  }

  encode<T>(value: T): Tagged<T> {
    return this.encodeValue(value) ?? [null, null];
  }

  decode<T>(value: Tagged<T>): T {
    return this.decodeValue(value) as T;
  }

  // --

  stringify<T>(value: T): string {
    return JSON.stringify(this.encode<T>(value));
  }

  parse<T>(value: string): T {
    return this.decode<T>(JSON.parse(value));
  }

  // --

  private encodeValue(value: unknown): Tagged<unknown> | null {
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null
    ) {
      return [value, null];
    } else if (typeof value === "object") {
      if (value.constructor === Object) {
        const encodedValues = Object.entries(value)
          .map(([key, innerValue]) => [key, this.encodeValue(innerValue)] as const)
          .filter(([_key, innerValue]) => innerValue !== null) as [string, Tagged<unknown>][];

        const [values, tags]: [JsonObject, TagObject] = [{}, {}];

        encodedValues.forEach(([key, [value, tag]]) => {
          values[key] = value;
          if (tag !== null) tags[key] = tag;
        });

        return [values, Object.keys(tags).length === 0 ? null : tags];
      } else if (Array.isArray(value)) {
        const encodedValues = value.map((innerValue) => this.encodeValue(innerValue));

        const [values, tags]: [JsonValue[], TagValue[]] = [[], []];

        encodedValues.forEach((tagged, index) => {
          if (tagged === null) return;

          const [value, tag] = tagged;

          values[index] = value;
          if (tag !== null) tags[index] = tag;
        });

        return [values, tags.length === 0 ? null : tags];
      } else {
        return this.encodeExtension(value);
      }
    } else {
      return this.encodeExtension(value);
    }
  }

  private encodeExtension(value: unknown): Tagged<unknown> | null {
    for (const [tag, extension] of this.extensions) {
      if (extension.check(value, { tag, instance: this }))
        return [extension.encode(value, { tag, instance: this }), tag];
    }
    return null;
  }

  // --

  private decodeValue(tagged: Tagged<unknown>): unknown {
    const [value, tag] = tagged;

    if (tag === null) {
      return value;
    } else if (typeof tag === "string" || typeof tag === "number") {
      return this.decodeExtension(value, tag);
    } else if (typeof tag === "object") {
      if (Array.isArray(tag)) {
        const values = value as JsonArray;
        const tags = tag as TagArray;

        const decodedValues = values.map((innerValue, index) =>
          this.decodeValue([innerValue, tags[index] ?? null])
        );

        return decodedValues;
      } else if (tag.constructor === Object) {
        const values = Object.entries(value as JsonObject);
        const tags = tag;

        const decodedValues = Object.fromEntries(
          values.map(([key, innerValue]) => {
            return [key, this.decodeValue([innerValue, tags[key] ?? null])];
          })
        );

        return decodedValues;
      } else {
        throw new DecodeError(value, tag);
      }
    } else {
      throw new DecodeError(value, tag);
    }
  }

  private decodeExtension(value: JsonValue, tag: Tag): unknown {
    const extension = this.extensions.get(tag);
    if (!extension) return null;
    return extension.decode(value, { tag, instance: this });
  }
}

export const Jasone = new JasoneCodec();

// set default extensions
Jasone.extensions.set(0, undefinedExtension);
Jasone.extensions.set(1, dateExtension);
Jasone.extensions.set(2, setExtension);
Jasone.extensions.set(3, mapExtension);
