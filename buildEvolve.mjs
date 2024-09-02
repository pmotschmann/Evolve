import * as esbuild from 'esbuild';

await esbuild
    .build({
        logLevel: "info",
        entryPoints: ["./src/main.js"],
        bundle: true,
        minify: true,
        outfile: "dist/evolve/main.js",
    })
    .catch(() => process.exit(1))
;

await esbuild
    .build({
        logLevel: "info",
        entryPoints: ["./src/evolve.js"],
        bundle: true,
        minify: true,
        outfile: "dist/evolve/evolve.js",
    })
    .catch(() => process.exit(1))
;
