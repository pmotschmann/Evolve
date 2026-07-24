require("esbuild")
  .build({
    logLevel: "info",
    entryPoints: ["./src/main-repaired.js"],
    bundle: true,
    minify: true,
    outfile: "evolve/main.js",
  })
  .catch(() => process.exit(1));
