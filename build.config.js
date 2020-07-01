const { flattenPaths } = require('./gulp/utils');

const DEST_DIR = 'dist';

const STATIC_FILE_GLOBS = flattenPaths(
  {
    '/': '.htaccess',
    assets: {
      img: 'assets/*',
      icons: 'assets/icons/**/*',
      textures: 'assets/textures/**/*',
      spritesheets: 'assets/spritesheets/**/*',
    },
  },
  DEST_DIR
);

module.exports = { DEST_DIR, STATIC_FILE_GLOBS };
