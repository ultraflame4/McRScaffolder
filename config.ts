import * as esbuild from 'esbuild'

await esbuild.build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    outdir:"bin",
    allowOverwrite: true,
    format: "esm",
    platform: "node",
    packages: "external",
    splitting: true
})
