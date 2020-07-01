const { flattenPaths } = require('./gulp/utils');

const DEST_DIR = 'dist';

const staticFiles = {
  '/': '.htaccess',
  assets: {
    img: 'assets/*',
    icons: 'assets/icons/**/*',
    textures: 'assets/textures/**/*',
    spritesheets: 'assets/spritesheets/**/*',
  },
};

const flattenedStaticFiles = flattenPaths(staticFiles, DEST_DIR);

module.exports = { DEST_DIR, flattenedStaticFiles };
