const gulp = require('gulp');

const using = require('gulp-using');
const { handleSassImports, endStream, flattenObject } = require('./gulp/utils');

const del = require('del');
const webpack = require('webpack-stream');
const eslint = require('gulp-eslint');
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

const lintScripts = () =>
  gulp
    .src(scriptSources, { since: gulp.lastRun(lintScripts) })
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
lintScripts.displayName = 'lint';

const compileScriptsAndHTML = () =>
  gulp
    .src(Object.values(webpackConfig.entry).concat(pugSources), {
      since: gulp.lastRun(compileScriptsAndHTML),
    })
    .pipe(using({ prefix: 'Compiling', filesize: true }))
    .pipe(webpack(webpackConfig).on('error', endStream))
    .pipe(gulp.dest('dist'))
    .pipe(using({ prefix: 'Writing', filesize: true }));
compileScriptsAndHTML.displayName = 'compile';

const lintAndCompileScriptsAndHTML = gulp.series(lintScripts, compileScriptsAndHTML);
lintAndCompileScriptsAndHTML.displayName = 'scripts_html';

const compileStyles = () =>
  gulp
    .src(styleSources, {
      sourcemaps: true,
      since: gulp.lastRun(compileStyles),
    })
    .pipe(handleSassImports({ firstRun: !gulp.lastRun(compileStyles) }))
    .pipe(sass.sync(sassOptions).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(gulp.dest('dist', { sourcemaps: 'maps' }))
    .pipe(using({ prefix: 'Writing', filesize: true }));
compileStyles.displayName = 'styles';

const watchScriptsAndHTML = () =>
  gulp.watch(scriptAndPugSources, { ignoreInitial: false }, lintAndCompileScriptsAndHTML);
watchScriptsAndHTML.displayName = 'watch:scripts_html';

const watchStyles = () => gulp.watch(styleSources, { ignoreInitial: false }, compileStyles);
watchStyles.displayName = 'watch:styles';

exports.copyStatic = copyStatic;
exports.scripts = lintAndCompileScriptsAndHTML;
exports.styles = compileStyles;
exports.watch = gulp.series(copyStatic, gulp.parallel(watchScriptsAndHTML, watchStyles));

exports.default = gulp.series(
  copyStatic,
  gulp.parallel(lintAndCompileScriptsAndHTML, compileStyles)
);
