import { emptyDir, build } from "@deno/dnt";

await emptyDir("./npm");

await build({
  outDir: "./npm",
  entryPoints: ["./src/mod.ts"],
  package: { name: "jasone", version: "0.0.1" },
  shims: {},
});
