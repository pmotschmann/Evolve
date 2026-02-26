import * as esbuild from "esbuild"

let ctx = await esbuild.context({
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
})


try {
    await ctx.serve({ port: 8000, servedir: "." })
    await ctx.watch()
} catch (err) {
    ctx.dispose()
    console.error("Error:", err.message)
    process.exit(1)
}
