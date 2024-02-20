require("esbuild")
  .build({
    logLevel: "debug",
    entryPoints: ["./src/wiki/wiki.js"],
    bundle: true,
    minify: false,
    sourcemap : true,
    outfile: "wiki/wiki.js",
  })
  .catch(() => process.exit(1));
