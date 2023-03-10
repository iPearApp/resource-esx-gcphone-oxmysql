const {resolve} = require('path');
const buildPath = resolve(__dirname, "dist");

const {build} = require('esbuild');

const client = build({
    entryPoints: ['./client/main.ts'],
    outdir: resolve(buildPath, 'client'),
    bundle: true,
    minify: true,
    platform: 'browser',
    target: 'es2020',
    logLevel: 'info'
});

const server = build({
    entryPoints: ['./server/main.ts'],
    outfile: 'dist/server/main.js',
    platform: 'node',
    bundle: true,
    logLevel: 'info',
});

Promise.all([client, server]).catch(() => process.exit(1))
