require("esbuild")
  .build({
    logLevel: "debug",
    entryPoints: ["./src/main.js"],
    bundle: true,
    minify: false,
    sourcemap : true,
    outfile: "evolve/main.js",
  })
  .catch(() => process.exit(1));
