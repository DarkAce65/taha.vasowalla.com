const gulp = require('gulp');

const using = require('gulp-using');
const gulpif = require('gulp-if');
const { handleSassImports, endStream, flattenObject } = require('./gulp/utils');

const del = require('del');
const webpack = require('webpack-stream');
const sass = require('gulp-sass');
sass.compiler = require('sass');
const autoprefixer = require('gulp-autoprefixer');

const staticFiles = {
  assets: { img: '../img/*', icons: '../img/icons/**/*', textures: 'assets/textures/**/*' },
};
const scriptSources = 'src/**/*.js';
const pugSources = ['src/**/*.pug', '!src/partials/**/*'];
const scriptAndPugSources = [scriptSources].concat(pugSources);
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

const compileScriptsAndHTML = () => {
  const since = gulp.lastRun(compileScriptsAndHTML);
  const firstRun = !since;

  return gulp
    .src(Object.values(webpackConfig.entry).concat(pugSources), { since })
    .pipe(gulpif(!firstRun, using({ prefix: 'Compiling' })))
    .pipe(webpack(webpackConfig, require('webpack')).on('error', endStream))
    .pipe(gulp.dest('dist'));
};
compileScriptsAndHTML.displayName = 'scripts_html';

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

const watchScriptsAndHTML = () =>
  gulp.watch(scriptAndPugSources, { ignoreInitial: false }, compileScriptsAndHTML);
watchScriptsAndHTML.displayName = 'watch:scripts_html';

const watchStyles = () => gulp.watch(styleSources, { ignoreInitial: false }, compileStyles);
watchStyles.displayName = 'watch:styles';

exports.copyStatic = copyStatic;
exports.scripts = compileScriptsAndHTML;
exports.styles = compileStyles;
exports.watch = gulp.series(copyStatic, gulp.parallel(watchScriptsAndHTML, watchStyles));

exports.default = gulp.series(copyStatic, gulp.parallel(compileScriptsAndHTML, compileStyles));
