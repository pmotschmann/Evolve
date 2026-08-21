// Bundles the save codec on its own as a browser global (window.EvolveSave) so the standalone
// pages -- save.html, and anything else outside the two module bundles -- can decode saves
// without re-implementing the container format.
require("esbuild")
  .build({
    logLevel: "info",
    entryPoints: ["./src/save.js"],
    bundle: true,
    minify: true,
    format: "iife",
    globalName: "EvolveSave",
    outfile: "evolve/save-codec.js",
  })
  .catch(() => process.exit(1));
