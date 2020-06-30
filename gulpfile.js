/* eslint-disable import/order */

const path = require('path');
const gulp = require('gulp');
// Utils
const using = require('gulp-using');
const gulpif = require('gulp-if');
// Build tools
const del = require('del');
const webpackStream = require('webpack-stream');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const sass = require('gulp-sass');
sass.compiler = require('sass');
const autoprefixer = require('gulp-autoprefixer');

const { endStream, flattenPaths, debounceStream, handleSassImports } = require('./gulp/utils');
const webpackConfig = require('./webpack.config.js');

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
const styleSources = 'src/**/*.scss';

const sassOptions = {
  includePaths: ['node_modules/'],
};

const flattenedStaticFiles = flattenPaths(staticFiles, DEST_DIR);

const cleanStatic = () => {
  const normalizedDistDir = path.posix.join(DEST_DIR, path.posix.sep);

  return del(
    Object.keys(flattenedStaticFiles).filter((staticPath) => staticPath !== normalizedDistDir)
  );
};
cleanStatic.displayName = 'clean:static';

const copyStatic = gulp.series(
  cleanStatic,
  gulp.parallel(
    ...Object.entries(flattenedStaticFiles).map(([destPath, source]) => {
      const copyStaticFiles = () =>
        gulp
          .src(source)
          .pipe(gulp.dest(destPath))
          .pipe(using({ prefix: 'Writing', filesize: true }));
      copyStaticFiles.displayName = 'copy:static:subtask';

      return copyStaticFiles;
    })
  )
);
copyStatic.displayName = 'copy:static';

const compileScriptsAndHTML = () =>
  gulp
    .src(Object.values(webpackConfig.entry))
    .pipe(using({ prefix: 'Compiling' }))
    .pipe(webpackStream(webpackConfig, webpack).on('error', endStream))
    .pipe(gulp.dest(DEST_DIR));
compileScriptsAndHTML.displayName = 'scripts_html';

const devServer = () => {
  const {
    devServer: { host, port },
  } = webpackConfig;
  return new WebpackDevServer(webpack(webpackConfig), webpackConfig.devServer).listen(port, host);
};
devServer.displayName = 'dev_server:run';

const compileStyles = () => {
  const since = gulp.lastRun(compileStyles);
  const firstRun = !since;

  return gulp
    .src(styleSources, { sourcemaps: true, since })
    .pipe(gulpif(!firstRun && /_[^/]*$/, using({ prefix: 'Compiling dependents of' })))
    .pipe(handleSassImports({ firstRun }))
    .pipe(debounceStream())
    .pipe(sass.sync(sassOptions).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(gulp.dest(DEST_DIR, { sourcemaps: 'maps' }))
    .pipe(using({ prefix: 'Writing', filesize: true }));
};
compileStyles.displayName = 'styles';

const watchStyles = () => gulp.watch(styleSources, compileStyles);
watchStyles.displayName = 'watch:styles';

exports.copyStatic = copyStatic;
exports.scripts = compileScriptsAndHTML;
exports.styles = compileStyles;
exports.watch = gulp.series(copyStatic, compileStyles, gulp.parallel(devServer, watchStyles));

exports.default = gulp.series(copyStatic, gulp.parallel(compileScriptsAndHTML, compileStyles));
