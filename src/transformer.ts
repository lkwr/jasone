import type {
  ClassLike,
  JsonValue,
  MatchesFn,
  TypeDecoder,
  TypeEncoder,
} from "./types.ts";

export type TypeMatcher<TType> =
  | {
      matches: MatchesFn<TType>;
    }
  | {
      target: ClassLike<TType>;
    };

export type TypeTransformer<
  TType,
  TJson extends JsonValue,
> = TypeMatcher<TType> & {
  typeId: string | number;

  encode: TypeEncoder<TType, TJson>;
  decode: TypeDecoder<TType, TJson>;
};

export const createType = <TType, TJson extends JsonValue>(
  transformer: TypeTransformer<TType, TJson>,
): TypeTransformer<TType, TJson> => {
  return transformer;
};
