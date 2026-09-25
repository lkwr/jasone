import type { Jasone } from "./jasone.ts";
import type {
  ClassLike,
  Context,
  JsonValue,
  NonJsonType,
  TypeId,
} from "./types.ts";
import { matchDecoderFilters, matchEncoderFilters } from "./utils.ts";

/**
 * The internal state of a Jasone instance.
 *
 * The fields are TypeScript-`private`, so they are invisible to consumers at
 * the type level but exist as regular properties at runtime, which lets this
 * module access them through a type cast.
 */
type JasoneInternals = {
  _typeIdentifier: Jasone["_typeIdentifier"];

  _anyDecoder: Jasone["_anyDecoder"];
  _typeIdDecoder: Jasone["_typeIdDecoder"];

  _anyEncoder: Jasone["_anyEncoder"];
  _classEncoder: Jasone["_classEncoder"];
  _customEncoder: Jasone["_customEncoder"];
};

const getInternals = (jasone: Jasone): JasoneInternals =>
  jasone as unknown as JasoneInternals;

/**
 * Check whether a value can be encoded to a JSON-compatible Jasone encoded
 * value using the encoders registered on the given Jasone instance.
 *
 * Arrays and plain objects are checked recursively, so this returns `true`
 * only if all nested entries can be encoded as well.
 *
 * If this returns `false`, {@link Jasone.prototype.encode} would throw an
 * `UnhandledValueError` for the same value. Note that this only runs the
 * encoder filters, not the handlers.
 *
 * @param jasone The Jasone instance whose encoders should be used.
 * @param value The value to check.
 * @param context An optional arbitrary object that is passed to all encoder filters.
 * @returns Whether the value can be encoded.
 */
export const isEncodable = (
  jasone: Jasone,
  value: unknown,
  context: Context = {},
): boolean => isEncodableValue(getInternals(jasone), jasone, value, context);

const isEncodableValue = (
  internals: JasoneInternals,
  jasone: Jasone,
  value: unknown,
  context: Context,
): boolean => {
  const {
    _anyEncoder: anyEncoder,
    _classEncoder: classEncoder,
    _customEncoder: customEncoder,
  } = internals;

  const type = typeof value;

  switch (type) {
    case "boolean":
    case "number":
    case "string":
      return true;

    case "object":
      // null
      if (value === null) return true;

      // array
      if (Array.isArray(value))
        return (value as unknown[]).every((entry) =>
          isEncodableValue(internals, jasone, entry, context),
        );

      // raw object
      if (Object.getPrototypeOf(value) === Object.prototype)
        return Object.values(value as Record<string, unknown>).every((inner) =>
          isEncodableValue(internals, jasone, inner, context),
        );
  }

  if (
    type === "object" &&
    classEncoder
      .get((value as object).constructor as ClassLike<unknown>)
      ?.some((inner) =>
        matchEncoderFilters(inner.filter, value, jasone, context),
      )
  )
    return true;

  if (
    customEncoder[type as keyof NonJsonType].some((inner) =>
      matchEncoderFilters(inner.filter, value, jasone, context),
    )
  )
    return true;

  return anyEncoder.some((inner) =>
    matchEncoderFilters(inner.filter, value, jasone, context),
  );
};

/**
 * Check whether a Jasone encoded value can be decoded using the decoders
 * registered on the given Jasone instance.
 *
 * Arrays and plain objects are checked recursively, so this returns `true`
 * only if all nested entries can be decoded as well.
 *
 * If this returns `false`, {@link Jasone.prototype.decode} would throw an
 * `UnknownTypeIdError` or `NonJsonValueError` for the same value. Note that
 * this cannot account for errors thrown inside decoder handlers at runtime,
 * like missing context data.
 *
 * @param jasone The Jasone instance whose decoders should be used.
 * @param value The Jasone encoded value to check.
 * @param context An optional arbitrary object that is passed to all decoder filters.
 * @returns Whether the value can be decoded.
 */
export const isDecodable = (
  jasone: Jasone,
  value: JsonValue,
  context: Context = {},
): boolean =>
  isDecodableValue(getInternals(jasone), jasone, value, context, false);

const isDecodableValue = (
  internals: JasoneInternals,
  jasone: Jasone,
  value: JsonValue,
  context: Context,
  ignoreTypeIdentifier: boolean,
): boolean => {
  const {
    _typeIdentifier: typeIdentifier,
    _anyDecoder: anyDecoder,
    _typeIdDecoder: typeIdDecoder,
  } = internals;

  switch (typeof value) {
    case "boolean":
    case "number":
    case "string":
      return true;
    case "object":
      // null
      if (value === null) return true;

      // raw array
      if (Array.isArray(value))
        return value.every((inner) =>
          isDecodableValue(internals, jasone, inner, context, false),
        );

      // typed objects
      if (typeIdentifier in value && !ignoreTypeIdentifier) {
        const typeId = value[typeIdentifier] as TypeId | [JsonValue];

        // if the type identifier is an array, its an escaped object
        if (Array.isArray(typeId)) {
          const [escaped] = typeId;
          const cloned = { ...value };

          cloned[typeIdentifier] = escaped;

          return isDecodableValue(internals, jasone, cloned, context, true);
        }

        if (typeIdDecoder.has(typeId)) return true;

        return anyDecoder.some((entry) =>
          matchDecoderFilters(entry.filter, value, typeId, jasone, context),
        );
      }

      // raw object
      if (Object.getPrototypeOf(value) === Object.prototype)
        return Object.values(value).every((inner) =>
          isDecodableValue(internals, jasone, inner, context, false),
        );

      return false;
  }

  return false;
};
