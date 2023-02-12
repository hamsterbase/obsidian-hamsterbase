const manifest = require('../manifest.json');
const { version } = require('../package.json');

function getManifest() {
  return {
    ...manifest,
    version,
  };
}

module.exports = getManifest;
