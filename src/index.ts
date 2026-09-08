import { Jasone as JasoneCore, type JasoneOptions } from "./jasone.ts";
import { builtInTransformers } from "./transformers/index.ts";

export type { JasoneOptions } from "./jasone.ts";
export * from "./transformers/index.ts";
export * from "./types.ts";

/**
 * Jasone is a JSON encoder and decoder that can handle custom types.
 *
 * This is a wrapper around the jasone/core class with builtin transformers
 * like `undefined`, `Map`, etc.
 *
 * It exposes the default Jasone instance as `Jasone.default` and also
 * registers the methods as static methods on the class itself, so you
 * can easily use them without having to create an instance.
 *
 * ```ts
 * const encoded = Jasone.encode(value);
 * const decoded = Jasone.decode(value);
 * ```
 */
export class Jasone extends JasoneCore {
  constructor(options: JasoneOptions = {}) {
    super({
      ...options,
      transformers: [...(options.transformers ?? []), ...builtInTransformers],
    });
  }

  // -----------------------------------------------------------------------------
  // -                      Static Methods for convenience                       -
  // -----------------------------------------------------------------------------

  /**
   * The default Jasone instance with the default types already registered.
   */
  static default = new Jasone();

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
