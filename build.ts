import { copyFile, writeFile } from "node:fs/promises";
import { build } from "tsdown";
import packageJson from "./package.json" with { type: "json" };

await build({
  entry: [
    `${import.meta.dirname}/src/index.ts`,
    `${import.meta.dirname}/src/core.ts`,
    `${import.meta.dirname}/src/transformers/*.ts`,
  ],
  outDir: `${import.meta.dirname}/dist`,
  platform: "neutral",
  format: "esm",
  dts: true,
  clean: true,
  minify: { mangle: false },
});

const distPackageJson = {
  name: packageJson.name,
  version: packageJson.version,
  type: packageJson.type,
  author: packageJson.author,
  license: packageJson.license,

  module: "./index.js",
  types: "./index.d.ts",

  exports: {
    ".": "./index.js",
    "./core": "./core.js",
    "./transformers": "./transformers/index.js",
    "./transformers/*": "./transformers/*.js",
    "./package.json": "./package.json",
  },

  repository: packageJson.repository,
  homepage: packageJson.homepage,
  bugs: packageJson.bugs,
  keywords: packageJson.keywords,
};

await Promise.all([
  writeFile(
    `${import.meta.dirname}/dist/package.json`,
    JSON.stringify(distPackageJson, null, 2),
  ),
  copyFile(
    `${import.meta.dirname}/README.md`,
    `${import.meta.dirname}/dist/README.md`,
  ),
  copyFile(
    `${import.meta.dirname}/LICENSE.md`,
    `${import.meta.dirname}/dist/LICENSE.md`,
  ),
]);
