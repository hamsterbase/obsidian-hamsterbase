const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs/promises');

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
})();
