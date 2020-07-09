/* eslint-disable import/order */
const path = require('path');
const gulp = require('gulp');
// Utils
const log = require('fancy-log');
const chalk = require('chalk');
const using = require('gulp-using');
// Build tools
const del = require('del');
const webpackStream = require('webpack-stream');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const sass = require('gulp-sass');
sass.compiler = require('sass');
const autoprefixer = require('gulp-autoprefixer');

const { DEST_DIR, STATIC_FILE_GLOBS } = require('./build.config');
const { endStream, addSassDependents } = require('./gulp/utils');
const webpackConfig = require('./webpack.config.js');

const styleSources = 'src/**/*.scss';

const sassOptions = { includePaths: ['node_modules/'] };

const cleanDest = () =>
  del([path.posix.join(DEST_DIR, '**/*'), path.posix.join(DEST_DIR, '**/.*')]).then(() =>
    log(`Cleaning output directory ${chalk.magenta(DEST_DIR)}`)
  );
cleanDest.displayName = 'clean:dest';

const copyStatic = gulp.parallel(
  ...Object.entries(STATIC_FILE_GLOBS).map(([destPath, source]) => {
    const copyStaticFiles = () =>
      gulp
        .src(source)
        .pipe(gulp.dest(destPath))
        .pipe(using({ prefix: 'Writing', filesize: true }));
    copyStaticFiles.displayName = 'copy:static:subtask';

    return copyStaticFiles;
  })
);
copyStatic.displayName = 'copy:static';

const compileScriptsAndHTML = () =>
  gulp
    .src(Object.values(webpackConfig.entry))
    .pipe(using({ prefix: 'Compiling' }))
    .pipe(webpackStream(webpackConfig, webpack).on('error', endStream))
    .pipe(gulp.dest(DEST_DIR));
compileScriptsAndHTML.displayName = 'compile:markup_scripts';

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
    .pipe(addSassDependents({ skipDependents: firstRun }))
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
exports.watch = gulp.series(
  cleanDest,
  copyStatic,
  compileStyles,
  gulp.parallel(devServer, watchStyles)
);

exports.default = gulp.series(
  cleanDest,
  copyStatic,
  gulp.parallel(compileScriptsAndHTML, compileStyles)
);