import type { ExtensionTag, Extension } from "@jasone/types";

import { undefinedExtension } from "./extensions/undefined.ts";
import { bigintExtension } from "./extensions/bigint.ts";
import { dateExtension } from "./extensions/date.ts";
import { mapExtension } from "./extensions/map.ts";
import { regexpExtension } from "./extensions/regexp.ts";
import { setExtension } from "./extensions/set.ts";

export const commonExtensions: Array<Extension> = [
  bigintExtension,
  dateExtension,
  mapExtension,
  regexpExtension,
  setExtension,
  undefinedExtension,
];

export const commonExtensionsMap: Map<ExtensionTag, Extension> = new Map<
  ExtensionTag,
  Extension
>(
  commonExtensions.map((extension) => {
    if (extension.tag === undefined)
      throw new Error(`Unexpected error: common extensions must have a tag: ${extension}`);
    return [extension.tag, extension];
  })
);
