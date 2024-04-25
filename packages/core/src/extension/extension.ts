import { JasoneCodec } from "../jasone.ts";
import { JsonValue, ExtensionTag } from "../types.ts";

export type ExtensionContext = {
  readonly tag: ExtensionTag;
  readonly instance: JasoneCodec;
};

export type Extension<T = any, V extends JsonValue = any> = {
  /**
   * The optional tag to use for this extension.
   *
   * It is optional because the tag will be defined at the registration.
   */
  tag?: ExtensionTag;

  /**
   * A function that checks if a value is of the type this extension can encode.
   *
   * @param value The value to check.
   * @param ctx The context of the extension
   *            - `tag` is the used tag of the extension.
   *              (this can vary from the defined tag by using a different tag at the registration).
   *            - `instance` is the instance for further encoding/decoding
   * @returns `true` if the value is of the type this extension can encode, `false` otherwise.
   */
  check: (value: unknown, ctx: ExtensionContext) => value is T;

  /**
   * The function that encodes a value in json format.
   *
   * @param value The value to encode.
   * @param ctx The context of the extension
   *            - `tag` is the used tag of the extension
   *              (this can vary from the defined tag by using a different tag at the registration).
   *            - `instance` is the instance for further encoding/decoding.
   * @returns The encoded value in json format.
   */
  encode: (value: T, ctx: ExtensionContext) => V;

  /**
   * The function that decodes a value from json format.
   *
   * @param value The json value to decode into the extension type.
   * @param ctx The context of the extension
   *            - `tag` is the used tag of the extension
   *              (this can vary from the defined tag by using a different tag at the registration).
   *            - `instance` is the instance for further encoding/decoding.
   * @returns The decoded value in the extension type.
   */
  decode: (value: V, ctx: ExtensionContext) => T;
};
