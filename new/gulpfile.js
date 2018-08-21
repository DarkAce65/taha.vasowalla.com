const gulp = require('gulp');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');

const log = require('fancy-log');
const chalk = require('chalk');
const babel = require('gulp-babel');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');

const scriptGlob = ['**/script.js', '!node_modules/**'];
const styleGlob = ['**/*.scss', '!node_modules/**', '!**/_*.scss'];

const babelOptions = {
    presets: ['@babel/env'],
    plugins: ['@babel/plugin-transform-strict-mode']
};
const sassOptions = {
    includePaths: ['partials']
};
const autoprefixerOptions = {
    browsers: ['last 2 versions', '> 5%']
};

function babelError(error) {
    log.error(chalk.red(error.message));
    this.emit('end');
}

function compileScript(gulpSrc) {
    return () => gulp.src(gulpSrc)
        .pipe(sourcemaps.init())
        .pipe(babel(babelOptions)).on('error', babelError)
        .pipe(sourcemaps.write('maps'))
        .pipe(rename(function(path) {
            if(path.extname === '.js') {
                path.extname = '.dist.js';
            }
        }))
        .pipe(gulp.dest('.'));
}

function compileStyle(gulpSrc) {
    return () => gulp.src(gulpSrc)
        .pipe(sourcemaps.init())
        .pipe(sass(sassOptions).on('error', sass.logError))
        .pipe(autoprefixer(autoprefixerOptions))
        .pipe(sourcemaps.write('maps'))
        .pipe(gulp.dest('.'));
}

function watchFiles() {
    gulp.watch(scriptGlob)
        .on('add', function(path, stats) {
            compileScript(path)();
            log('Compiling new file ' + chalk.green(path) + '...');
        })
        .on('change', function(path, stats) {
            compileScript(path)();
            log('Recompiling ' + chalk.cyan(path) + '...');
        })
        .on('unlink', function(path) {
            log('Unlinking ' + chalk.red(path));
        });
    gulp.watch(styleGlob)
        .on('add', function(path, stats) {
            compileStyle(path)();
            log('Compiling new file ' + chalk.green(path) + '...');
        })
        .on('change', function(path, stats) {
            compileStyle(path)();
            log('Recompiling ' + chalk.cyan(path) + '...');
        })
        .on('unlink', function(path) {
            log('Unlinking ' + chalk.red(path));
        });
}

gulp.task('js', compileScript(scriptGlob));
gulp.task('scss', compileStyle(styleGlob));
gulp.task('default', gulp.parallel('js', 'scss'));
gulp.task('watch', gulp.series('default', watchFiles));
