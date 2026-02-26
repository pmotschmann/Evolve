const esbuild = require("esbuild");

common = {
    logLevel: "info",
    bundle: true,
    minify: true
}

main = { 
    entryPoints: ["./src/main.js"],
    outfile: "evolve/main.js"
}

wiki = { 
  entryPoints: ["./src/wiki/wiki.js"],
    outfile: "wiki/wiki.js"
}

esbuild
  .build({...common, ...main})
  .catch(() => process.exit(1));
esbuild
  .build({...common, ...wiki})
  .catch(() => process.exit(1));

