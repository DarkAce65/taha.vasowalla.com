const gulp = require('gulp');
const path = require('path');

const plumber = require('gulp-plumber');
const chalk = require('chalk');
const log = require('fancy-log');
const using = require('gulp-using');

const pug = require('gulp-pug');
const eslint = require('gulp-eslint');
const babel = require('gulp-babel');
const sass = require('gulp-sass');
sass.compiler = require('sass');
const autoprefixer = require('gulp-autoprefixer');

const pugSources = 'src/**/*.pug';
const scriptSources = 'src/**/*.js';
const scssPartials = 'src/**/_*.scss';
const styleSources = ['src/**/*.scss', `!${scssPartials}`];

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
    .src(scriptSources, { sourcemaps: true, since: gulp.lastRun(transpileScripts) })
    .pipe(babel(babelOptions))
    .pipe(gulp.dest('dist', { sourcemaps: 'maps' }))
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

exports.html = compileHTML;
exports.scripts = compileScripts;
exports.styles = compileStyles();
exports.watch = gulp.parallel(watchHTML, watchScripts, watchStyles, watchSCSSPartials);

exports.default = gulp.parallel(compileHTML, compileScripts, compileStyles());
