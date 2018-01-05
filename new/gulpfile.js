const gulp = require('gulp');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');

const log = require('fancy-log');
const chalk = require('chalk');
const babel = require('gulp-babel');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');

const babelOptions = {
    presets: ['@babel/env'],
    plugins: ['@babel/plugin-transform-strict-mode']
};
const sassOptions = {
    includePaths: ['colors']
};
const autoprefixerOptions = {
    browsers: ['last 2 versions', '> 5%']
};

function compileScript(gulpSrc) {
    return () => gulp.src(gulpSrc)
        .pipe(sourcemaps.init())
        .pipe(babel(babelOptions))
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
    gulp.watch(['**/script.js', '!node_modules/**/*.js'])
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
    gulp.watch(['**/*.scss', '!node_modules/**/*.scss'])
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

gulp.task('js', compileScript(['**/script.js', '!node_modules/**/*.js']));
gulp.task('scss', compileStyle(['**/*.scss', '!node_modules/**/*.scss']));
gulp.task('default', gulp.parallel('js', 'scss'));
gulp.task('watch', gulp.series('default', watchFiles));
