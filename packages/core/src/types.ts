export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export type JsonPrimitive = string | number | boolean | null;
export interface JsonObject extends Record<string, JsonValue> {}
export interface JsonArray extends Array<JsonValue> {}

//

export type ExtensionTag = string | number | null;

export type TagValue = ExtensionTag | TagObject | TagArray;
export interface TagObject extends Record<string, TagValue> {}
export interface TagArray extends Array<TagValue> {}

//

export type TaggedJson<T = unknown> = [JsonValue, TagValue];
