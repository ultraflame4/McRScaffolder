import * as esbuild from 'esbuild'

await esbuild.build({
    entryPoints: ['src/index.ts'],
    bundle: false,
    outdir:"bin",
    allowOverwrite: true,
    format: "esm",
    platform: "node",
    packages: "external",
    splitting: true
})
