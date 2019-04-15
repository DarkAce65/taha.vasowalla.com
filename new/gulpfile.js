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

const lintScripts = src =>
  function lint() {
    return gulp
      .src(src, { cwdbase: true })
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failAfterError());
  };

const transpileScripts = src =>
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

const compileScripts = src => gulp.series(lintScripts(src), transpileScripts(src));

const compileStyles = src =>
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
    .on('add', path => compileScripts(path)())
    .on('change', path => compileScripts(path)());

  gulp
    .watch(styleSources, { ignoreInitial: false, ignored: /(^|[/\\])\../ })
    .on('add', path => compileStyles(path)())
    .on('change', path => compileStyles(path)());

  gulp
    .watch(scssPartials, { ignored: /(^|[/\\])\../ })
    .on('add', compileStyles(styleSources))
    .on('change', compileStyles(styleSources));
};

gulp.task('scripts', compileScripts(scriptSources));
gulp.task('styles', compileStyles(styleSources));
gulp.task('default', gulp.parallel('scripts', 'styles'));
gulp.task('watch', watch);
