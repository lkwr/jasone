import { commonExtensionsMap } from "@jasone/common";

import type {
  Extension,
  ExtensionTag,
  JsonArray,
  JsonObject,
  JsonValue,
  TagArray,
  TagObject,
  TaggedJson,
  Class,
  JasoneCodec,
} from "@jasone/types";

import { DecodeError } from "./error.ts";
import { createClassExtension } from "./utils.ts";

export class JasoneConverter implements JasoneCodec {
  readonly extensions: Map<ExtensionTag, Extension>;

  constructor(extensions: Map<ExtensionTag, Extension> = new Map<ExtensionTag, Extension>()) {
    this.extensions = extensions;
  }

  encode<T>(value: T): TaggedJson<T> {
    return this.encodeValue(value) ?? [null, null];
  }

  decode<T>(value: TaggedJson<T>): T {
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

  addExtension(tag: ExtensionTag, extension: Extension): void {
    this.extensions.set(tag, extension);
  }

  addClass(clazz: Class): ExtensionTag {
    const extension = createClassExtension(clazz);

    // this should never happen
    if (extension.tag === undefined) throw new Error("Failed to get tag from class extension");

    this.addExtension(extension.tag, extension);
    return extension.tag;
  }

  // --

  private encodeValue(value: unknown): TaggedJson<unknown> | null {
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
          .filter(([_key, innerValue]) => innerValue !== null) as [
          string,
          TaggedJson<unknown>
        ][];

        const [values, tags]: [JsonObject, TagObject] = [{}, {}];

        encodedValues.forEach(([key, [value, tag]]) => {
          values[key] = value;
          if (tag !== null) tags[key] = tag;
        });

        return [values, Object.keys(tags).length === 0 ? null : tags];
      } else if (Array.isArray(value)) {
        const encodedValues = value.map((innerValue) => this.encodeValue(innerValue));

        const [values, tags]: [JsonArray, TagArray] = [[], []];

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

  private encodeExtension(value: unknown): TaggedJson<unknown> | null {
    for (const [tag, extension] of this.extensions) {
      if (extension.check(value, { tag, instance: this }))
        return [extension.encode(value, { tag, instance: this }), tag];
    }
    return null;
  }

  // --

  private decodeValue(tagged: TaggedJson<unknown>): unknown {
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

  private decodeExtension(value: JsonValue, tag: ExtensionTag): unknown {
    const extension = this.extensions.get(tag);
    if (!extension) return null;
    return extension.decode(value, { tag, instance: this });
  }
}

export const Jasone: JasoneConverter = new JasoneConverter(commonExtensionsMap);
