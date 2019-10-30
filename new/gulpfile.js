const gulp = require('gulp');

const using = require('gulp-using');
const gulpif = require('gulp-if');
const { handleSassImports, endStream, flattenObject } = require('./gulp/utils');

const del = require('del');
const webpackStream = require('webpack-stream');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const sass = require('gulp-sass');
sass.compiler = require('sass');
const autoprefixer = require('gulp-autoprefixer');

const staticFiles = {
  assets: {
    img: '../img/*',
    icons: '../img/icons/**/*',
    textures: 'assets/textures/**/*',
  },
};
const styleSources = 'src/**/*.scss';

const webpackConfig = require('./webpack.config.js');
const sassOptions = {
  includePaths: ['node_modules/'],
};

const cleanStatic = (destRootPath = '') => {
  const cleanStaticFiles = () =>
    del(
      Object.keys(flattenObject(staticFiles)).map(staticDir => `dist/${destRootPath}/${staticDir}`)
    );
  cleanStaticFiles.displayName = 'clean:static';

  return cleanStaticFiles;
};

const copyStatic = gulp.series(
  cleanStatic(),
  gulp.parallel(
    ...Object.entries(flattenObject(staticFiles)).map(([destPath, source]) => {
      const copyStaticFiles = () =>
        gulp
          .src(source)
          .pipe(gulp.dest(`dist/${destPath}`))
          .pipe(using({ prefix: 'Writing', filesize: true }));
      copyStaticFiles.displayName = `copy:${destPath.replace(/\//g, ':')}`;

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
    .pipe(gulp.dest('dist'));
compileScriptsAndHTML.displayName = 'scripts_html';

const devServer = () =>
  new WebpackDevServer(webpack(webpackConfig), webpackConfig.devServer).listen(5000, '127.0.0.1');
devServer.displayName = 'dev_server:scripts_html';

const compileStyles = () => {
  const since = gulp.lastRun(compileStyles);
  const firstRun = !since;

  return gulp
    .src(styleSources, { sourcemaps: true, since })
    .pipe(gulpif(!firstRun && /_[^/]*$/, using({ prefix: 'Compiling dependents of' })))
    .pipe(handleSassImports({ firstRun }))
    .pipe(sass.sync(sassOptions).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(gulp.dest('dist', { sourcemaps: 'maps' }))
    .pipe(using({ prefix: 'Writing', filesize: true }));
};
compileStyles.displayName = 'styles';

const watchStyles = () => gulp.watch(styleSources, { ignoreInitial: false }, compileStyles);
watchStyles.displayName = 'watch:styles';

exports.copyStatic = copyStatic;
exports.scripts = compileScriptsAndHTML;
exports.styles = compileStyles;
exports.watch = gulp.series(copyStatic, gulp.parallel(devServer, watchStyles));

exports.default = gulp.series(copyStatic, gulp.parallel(compileScriptsAndHTML, compileStyles));
