import {
  type Decoder,
  type Encoder,
  type JsonValue,
  nonJsonTypes,
  type TypeId,
} from "./types.ts";

export const matchEncoderFilters = (
  filterInput: Encoder["filter"],
  value: unknown,
): boolean => {
  if (!filterInput) return true;

  const filters = Array.isArray(filterInput) ? filterInput : [filterInput];

  const type = typeof value;

  for (const filter of filters) {
    if (filter.any?.(value)) return true;

    if (
      type === "object" &&
      value !== null &&
      filter.class === (value as object).constructor
    )
      return true;

    for (const field of nonJsonTypes) {
      if (type !== field) continue;

      const typeFilter = filter[field];
      if (typeFilter === true) return true;

      if ((typeFilter as ((value: unknown) => boolean) | undefined)?.(value))
        return true;
    }
  }

  return false;
};

export const matchDecoderFilters = (
  filterInput: Decoder["filter"],
  value: Record<string, JsonValue>,
  typeId: TypeId,
): boolean => {
  if (filterInput === undefined) return true;

  const filters = Array.isArray(filterInput) ? filterInput : [filterInput];

  for (const filter of filters) {
    if (typeof filter === "function" && filter(typeId, value)) return true;
    if (filter === typeId) return true;
  }

  return false;
};
