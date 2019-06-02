const gulp = require('gulp');

const using = require('gulp-using');

const eslint = require('gulp-eslint');
const babel = require('gulp-babel');
const sass = require('gulp-sass');
sass.compiler = require('sass');
const autoprefixer = require('gulp-autoprefixer');

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
      .pipe(sass.sync(sassOptions))
      .on('error', sass.logError)
      .pipe(autoprefixer(autoprefixerOptions))
      .pipe(gulp.dest('dist', { sourcemaps: 'maps' }))
      .pipe(using({ prefix: 'Writing', filesize: true }));
  compile.displayName = 'styles';

  return compile;
};

const watchScripts = () => gulp.watch(scriptSources, { ignoreInitial: false }, compileScripts);
watchScripts.displayName = 'watch:scripts';

const watchStyles = () => gulp.watch(styleSources, { ignoreInitial: false }, compileStyles());
watchStyles.displayName = 'watch:styles';

const watchSCSSPartials = () => gulp.watch(scssPartials, compileStyles({ compileAll: true }));
watchSCSSPartials.displayName = 'watch:scssPartials';

exports.html = compileHTML;
exports.scripts = compileScripts;
exports.styles = compileStyles();
exports.watch = gulp.parallel(watchScripts, watchStyles, watchSCSSPartials);

exports.default = gulp.parallel(compileHTML, compileScripts, compileStyles());
