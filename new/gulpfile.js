const gulp = require('gulp');

const using = require('gulp-using');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');

const eslint = require('gulp-eslint');
const babel = require('gulp-babel');
const sass = require('gulp-sass');
sass.compiler = require('sass');
const autoprefixer = require('gulp-autoprefixer');

const scriptSources = ['**/script.js', '!node_modules/**'];
const styleSources = ['**/*.scss', '!node_modules/**', '!**/_*.scss'];

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

function lintScripts(src) {
  return function lint() {
    return gulp
      .src(src)
      .pipe(using({ prefix: 'Linting' }))
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failAfterError());
  };
}

function transpileScripts(src) {
  return function transpile() {
    return gulp
      .src(src)
      .pipe(using({ prefix: 'Transpiling' }))
      .pipe(sourcemaps.init())
      .pipe(babel(babelOptions))
      .pipe(sourcemaps.write('maps'))
      .pipe(
        rename(function(path) {
          if (path.extname === '.js') {
            path.extname = '.dist.js';
          }
        })
      )
      .pipe(using({ prefix: 'Writing', filesize: true }))
      .pipe(gulp.dest('.'));
  };
}

function compileScripts(src) {
  return gulp.series(lintScripts(src), transpileScripts(src));
}

function compileStyles(src) {
  return function styles() {
    return gulp
      .src(src)
      .pipe(using({ prefix: 'Compiling' }))
      .pipe(sourcemaps.init())
      .pipe(sass.sync(sassOptions))
      .on('error', sass.logError)
      .pipe(autoprefixer(autoprefixerOptions))
      .pipe(sourcemaps.write('maps'))
      .pipe(using({ prefix: 'Writing', filesize: true }))
      .pipe(gulp.dest('.'));
  };
}

function watch() {
  gulp
    .watch(scriptSources, { ignoreInitial: false, ignored: /(^|[/\\])\../ })
    .on('add', function(path) {
      compileScripts(path)();
    })
    .on('change', function(path) {
      compileScripts(path)();
    });

  gulp
    .watch(styleSources, { ignoreInitial: false, ignored: /(^|[/\\])\../ })
    .on('add', function(path) {
      compileStyles(path)();
    })
    .on('change', function(path) {
      compileStyles(path)();
    });
}

gulp.task('scripts', compileScripts(scriptSources));
gulp.task('styles', compileStyles(styleSources));
gulp.task('default', gulp.parallel('scripts', 'styles'));
gulp.task('watch', watch);
