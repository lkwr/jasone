export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export type JsonPrimitive = string | number | boolean | null;
export interface JsonObject extends Record<string, JsonValue> {}
export interface JsonArray extends Array<JsonValue> {}

//

export type Tag = string | number | null;

export type TagValue = Tag | TagObject | TagArray;
export interface TagObject extends Record<string, TagValue> {}
export interface TagArray extends Array<TagValue> {}

//

export type Tagged<T = unknown> = [JsonValue, TagValue];
