const gulp = require('gulp');
const path = require('path');

const del = require('del');
const plumber = require('gulp-plumber');
const chalk = require('chalk');
const log = require('fancy-log');
const named = require('vinyl-named');
const using = require('gulp-using');

const pug = require('gulp-pug');
const webpack = require('webpack-stream');
const eslint = require('gulp-eslint');
const sass = require('gulp-sass');
sass.compiler = require('sass');
const autoprefixer = require('gulp-autoprefixer');

const staticFiles = {
  assets: { img: '../img/*', icons: '../img/icons/**/*', textures: 'assets/textures/**/*' },
};

const pugSources = 'src/**/*.pug';
const scriptSources = 'src/**/*.js';
const scssPartials = 'src/**/_*.scss';
const styleSources = ['src/**/*.scss', `!${scssPartials}`];

const sassOptions = {
  includePaths: ['partials'],
};

const flattenObject = (object, root = '') =>
  Object.entries(object).reduce((obj, [key, value]) => {
    const base = root === '' ? '' : `${root}/`;
    if (!Array.isArray(value) && typeof value === 'object') {
      return { ...obj, ...flattenObject(value, `${base}${key}`) };
    }

    obj[`${base}${key}`] = value;
    return obj;
  }, {});

const cleanStatic = (destRootPath = '') => {
  const cleanStaticFiles = () =>
    del(Object.keys(flattenObject(staticFiles)).map(staticDir => `dist/${destRootPath}/${staticDir}`));
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
      .pipe(autoprefixer())
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

exports.copyStatic = copyStatic;
exports.html = compileHTML;
exports.scripts = compileScripts;
exports.styles = compileStyles();
exports.watch = gulp.parallel(watchHTML, watchScripts, watchStyles, watchSCSSPartials);

exports.default = gulp.series(copyStatic, gulp.parallel(compileHTML, compileScripts, compileStyles()));
