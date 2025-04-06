import type {
  ClassLike,
  JsonValue,
  MatchesFn,
  TypeDecoder,
  TypeEncoder,
} from "./types.ts";

export type TypeMatcher<TType> =
  | {
      /**
       * The function that is responsible to determine if a value can be
       * encoded with this transformer.
       */
      matches: MatchesFn<TType>;
    }
  | {
      /**
       * The class that can be encoded with this transformer.
       *
       * Using the `target` property only works on classes with an
       * `constructor`. Internally, Jasone matches the constructor of the
       * class with the `target` property.
       */
      target: ClassLike<TType>;
    };

/**
 * A type transformer which is responsible for encoding and decoding a type.
 */
export type TypeTransformer<
  TType,
  TJson extends Record<string, JsonValue> = Record<string, JsonValue>,
> = TypeMatcher<TType> & {
  /**
   * The id of the type that is used to identify the type on decoding.
   *
   * This id should be unique for each type and it is recommended to use strings
   * to avoid conflicts with built-in types (which used positive integers).
   */
  typeId: string | number;

  /**
   * The function that is responsible to encode the type into a JSON-compatible
   * value.
   */
  encode: TypeEncoder<TType, TJson>;

  /**
   * The function that is responsible to decode the type from a JSON-compatible
   * value.
   */
  decode: TypeDecoder<TType, TJson>;
};

/**
 * A convenience function to create a type transformer which automatically
 * infer the types for you, so you don't have to.
 *
 * @param transformer The transformer to create.
 * @returns The exact same transformer you passed in, but with the types inferred.
 */
export const createType = <TType, TJson extends Record<string, JsonValue>>(
  transformer: TypeTransformer<TType, TJson>,
): TypeTransformer<TType, TJson> => {
  return transformer;
};
