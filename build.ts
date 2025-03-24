import { build } from "tsup";

await build({
  entry: [`${import.meta.dirname}/src/index.ts`],
  outDir: `${import.meta.dirname}/dist`,
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  minify: true,
});
