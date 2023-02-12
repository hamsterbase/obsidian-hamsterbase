const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs/promises');
const getManifest = require('./get-manifest');

const ProjectRoot = path.join(__dirname, '..');
const distRoot = path.join(ProjectRoot, 'dist');

(async () => {
  await fs.rm(distRoot, { recursive: true, force: true });
  await esbuild.build({
    entryPoints: [path.join(ProjectRoot, 'src', 'hamsterbase-plugin.ts')],
    outfile: path.join(distRoot, 'main.js'),
    bundle: true,
    external: ['obsidian', 'fs', 'path'],
    format: 'cjs',
  });
  await fs.writeFile(
    path.join(distRoot, 'manifest.json'),
    JSON.stringify(getManifest(), null, 2)
  );
})();
