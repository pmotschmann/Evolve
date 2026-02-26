import * as esbuild from "esbuild"

const params = {
    logLevel: "info",
    bundle: true,
    minify: true,

    // with multiple entrypoints, .js extension is appended
    // automatically, and outdir is required
    entryPoints: [
        { in: "./src/main.js", out: "evolve/main" },
        { in: "./src/wiki/wiki.js", out: "wiki/wiki" },
    ],
    outdir: "."
}

esbuild.build(params)
    .catch(() => process.exit(1));
