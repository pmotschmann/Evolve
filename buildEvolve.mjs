import * as esbuild from 'esbuild';

await esbuild
    .build({
        logLevel: "info",
        entryPoints: ["./src/main.js"],
        bundle: true,
        minify: true,
        outfile: "evolve/main.js",
    })
    .catch(() => process.exit(1))
;
