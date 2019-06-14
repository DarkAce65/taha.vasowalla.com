const gulp = require('gulp');
const path = require('path');

const del = require('del');
const plumber = require('gulp-plumber');
const chalk = require('chalk');
const log = require('fancy-log');
const named = require('vinyl-named');
const using = require('gulp-using');
const rename = require('gulp-rename');

const pug = require('gulp-pug');
const webpack = require('webpack-stream');
const eslint = require('gulp-eslint');
const sass = require('gulp-sass');
sass.compiler = require('sass');
const autoprefixer = require('gulp-autoprefixer');

const assets = {
  static: { icons: '../img/icons/**/*', textures: 'static/textures/**/*' },
  lib: { js: 'node_modules/three/examples/js/GPUParticleSystem.js' },
};

const pugSources = 'src/**/*.pug';
const scriptSources = 'src/**/*.js';
const scssPartials = 'src/**/_*.scss';
const styleSources = ['src/**/*.scss', `!${scssPartials}`];

const sassOptions = {
  includePaths: ['partials'],
};
const autoprefixerOptions = {
  browsers: ['last 2 versions', '> 5%'],
};

const cleanAssets = () => del(['dist/static', 'dist/lib']);
cleanAssets.displayName = 'clean:assets';

const copyAssets = gulp.series(
  cleanAssets,
  gulp.parallel(
    ...Object.entries(assets.static).map(([assetType, asset]) => {
      const copyAsset = () =>
        gulp
          .src(asset)
          .pipe(
            rename(file => {
              file.dirname = path.join(assetType, file.dirname);
            })
          )
          .pipe(gulp.dest('dist/static'))
          .pipe(using({ prefix: 'Writing', filesize: true }));
      copyAsset.displayName = `copy:static:${assetType}`;
      return copyAsset;
    }),
    ...Object.entries(assets.lib).map(([assetType, asset]) => {
      const copyLib = () =>
        gulp
          .src(asset)
          .pipe(
            rename(file => {
              file.dirname += `/${assetType}`;
            })
          )
          .pipe(gulp.dest('dist/lib'))
          .pipe(using({ prefix: 'Writing', filesize: true }));
      copyLib.displayName = `copy:lib:${assetType}`;
      return copyLib;
    })
  )
);
copyAssets.displayName = 'copy:assets';

const compileHTML = () =>
  gulp
    .src(pugSources, { since: gulp.lastRun(compileHTML) })
    .pipe(plumber())
    .pipe(
      pug({ pretty: true }).on('error', error => {
        if (error.path) {
          log(
            `${chalk.red(error.name)} in ${chalk.magenta(path.relative(process.cwd(), error.path))}\n`,
            error.message
          );
        } else if (error.code && error.filename) {
          log(
            `${chalk.red(error.code)} in ${chalk.magenta(path.relative(process.cwd(), error.filename))}\nMessage: ${
              error.msg
            }`
          );
        } else {
          log(error.message);
        }
      })
    )
    .pipe(plumber.stop())
    .pipe(gulp.dest('dist'))
    .pipe(using({ prefix: 'Writing', filesize: true }));

const lintScripts = () =>
  gulp
    .src(scriptSources, { since: gulp.lastRun(lintScripts) })
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
lintScripts.displayName = 'lint';

const transpileScripts = () =>
  gulp
    .src(scriptSources, { since: gulp.lastRun(transpileScripts) })
    .pipe(named(file => path.relative('src', path.join(file.dirname, file.stem))))
    .pipe(webpack({ ...require('./webpack.config.js'), mode: process.env.NODE_ENV || 'development' }))
    .pipe(gulp.dest('dist'))
    .pipe(using({ prefix: 'Writing', filesize: true }));
transpileScripts.displayName = 'transpile';

const compileScripts = gulp.series(lintScripts, transpileScripts);
compileScripts.displayName = 'scripts';

const compileStyles = ({ compileAll } = {}) => {
  const compile = () =>
    gulp
      .src(styleSources, {
        sourcemaps: true,
        since: compileAll ? null : gulp.lastRun(compile),
      })
      .pipe(sass.sync(sassOptions).on('error', sass.logError))
      .pipe(autoprefixer(autoprefixerOptions))
      .pipe(gulp.dest('dist', { sourcemaps: 'maps' }))
      .pipe(using({ prefix: 'Writing', filesize: true }));
  compile.displayName = 'styles';

  return compile;
};

const watchHTML = () => gulp.watch(pugSources, { ignoreInitial: false }, compileHTML);
watchHTML.displayName = 'watch:html';

const watchScripts = () => gulp.watch(scriptSources, { ignoreInitial: false }, compileScripts);
watchScripts.displayName = 'watch:scripts';

const watchStyles = () => gulp.watch(styleSources, { ignoreInitial: false }, compileStyles());
watchStyles.displayName = 'watch:styles';

const watchSCSSPartials = () => gulp.watch(scssPartials, compileStyles({ compileAll: true }));
watchSCSSPartials.displayName = 'watch:scssPartials';

exports.copyAssets = copyAssets;
exports.html = compileHTML;
exports.scripts = compileScripts;
exports.styles = compileStyles();
exports.watch = gulp.parallel(watchHTML, watchScripts, watchStyles, watchSCSSPartials);

exports.default = gulp.parallel(compileHTML, compileScripts, compileStyles());
