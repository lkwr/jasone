import { build } from "tsup";

import packageJson from "./package.json" with { type: "json" };

await build({
  entry: [`${import.meta.dirname}/src/index.ts`],
  outDir: `${import.meta.dirname}/dist`,
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  minify: true,
});

const distPackageJson = {
  name: packageJson.name,
  version: packageJson.version,
  type: packageJson.type,
  author: packageJson.author,
  license: packageJson.license,

  main: "./index.cjs",
  module: "./index.js",
  types: "./index.d.ts",

  exports: {
    ".": {
      import: "./index.js",
      require: "./index.cjs",
      types: "./index.d.ts",
    },
  },

  repository: packageJson.repository,
  homepage: packageJson.homepage,
  bugs: packageJson.bugs,
  keywords: packageJson.keywords,
};

await Promise.all([
  Bun.file(`${import.meta.dirname}/dist/package.json`).write(
    JSON.stringify(distPackageJson, null, 2),
  ),
  Bun.file(`${import.meta.dirname}/dist/README.md`).write(
    Bun.file(`${import.meta.dirname}/README.md`),
  ),
  Bun.file(`${import.meta.dirname}/dist/LICENSE.md`).write(
    Bun.file(`${import.meta.dirname}/LICENSE.md`),
  ),
]);
