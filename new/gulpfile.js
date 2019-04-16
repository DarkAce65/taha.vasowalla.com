const path = require('path');
const gulp = require('gulp');

const using = require('gulp-using');
const rename = require('gulp-rename');

const eslint = require('gulp-eslint');
const babel = require('gulp-babel');
const sass = require('gulp-sass');
sass.compiler = require('sass');
const autoprefixer = require('gulp-autoprefixer');

const scriptSources = ['**/script.js', '!node_modules/**'];
const styleSources = ['**/*.scss', '!node_modules/**', '!**/_*.scss'];
const scssPartials = ['**/_*.scss', '!node_modules/**'];

const babelOptions = {
  presets: ['@babel/env'],
  plugins: ['@babel/plugin-transform-strict-mode'],
};
const sassOptions = {
  includePaths: ['partials'],
};
const autoprefixerOptions = {
  browsers: ['last 2 versions', '> 5%'],
};

const makeLintScriptsTask = src =>
  function lint() {
    return gulp
      .src(src, { cwdbase: true })
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failAfterError());
  };

const makeTranspileScriptsTask = src =>
  function transpile() {
    return gulp
      .src(src, { cwdbase: true, sourcemaps: true })
      .pipe(babel(babelOptions))
      .pipe(
        rename(function(path) {
          if (path.extname === '.js') {
            path.extname = '.dist.js';
          }
        })
      )
      .pipe(
        gulp.dest(file => file.base, {
          sourcemaps: file => path.join(path.relative(file.base, process.cwd()), 'maps'),
        })
      )
      .pipe(using({ prefix: 'Writing', path: 'relative', filesize: true }));
  };

const makeCompileScriptsTask = src => gulp.series(makeLintScriptsTask(src), makeTranspileScriptsTask(src));

const makeCompileStylesTask = src =>
  function styles() {
    return gulp
      .src(src, { cwdbase: true, sourcemaps: true })
      .pipe(sass.sync(sassOptions))
      .on('error', sass.logError)
      .pipe(autoprefixer(autoprefixerOptions))
      .pipe(
        gulp.dest(file => file.base, {
          sourcemaps: file => path.join(path.relative(file.base, process.cwd()), 'maps'),
        })
      )
      .pipe(using({ prefix: 'Writing', path: 'relative', filesize: true }));
  };

const watch = () => {
  gulp
    .watch(scriptSources, { ignoreInitial: false, ignored: /(^|[/\\])\../ })
    .on('add', path => makeCompileScriptsTask(path)())
    .on('change', path => makeCompileScriptsTask(path)());

  gulp
    .watch(styleSources, { ignoreInitial: false, ignored: /(^|[/\\])\../ })
    .on('add', path => makeCompileStylesTask(path)())
    .on('change', path => makeCompileStylesTask(path)());

  gulp
    .watch(scssPartials, { ignored: /(^|[/\\])\../ })
    .on('add', makeCompileStylesTask(styleSources))
    .on('change', makeCompileStylesTask(styleSources));
};

gulp.task('scripts', makeCompileScriptsTask(scriptSources));
gulp.task('styles', makeCompileStylesTask(styleSources));
gulp.task('default', gulp.parallel('scripts', 'styles'));
gulp.task('watch', watch);
