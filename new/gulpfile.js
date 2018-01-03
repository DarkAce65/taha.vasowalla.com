const gulp = require('gulp');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');

const babel = require('gulp-babel');
const sass = require('gulp-sass');
const bourbon = require('bourbon').includePaths;
const autoprefixer = require('gulp-autoprefixer');

const babelOptions = {
    presets: ['@babel/env']
};
const sassOptions = {
    includePaths: ['colors'].concat(bourbon)
};
const autoprefixerOptions = {
    browsers: ['last 2 versions', '> 5%']
};

gulp.task('js', function () {
    return gulp.src(['**/script.js', '!node_modules/**/*.js'])
        .pipe(sourcemaps.init())
        .pipe(babel(babelOptions))
        .pipe(sourcemaps.write('maps'))
        .pipe(rename(function(path) {
            if(path.extname === '.js') {
                path.extname = '.dist.js';
            }
        }))
        .pipe(gulp.dest('.'));
});

gulp.task('scss', function () {
    return gulp.src(['**/*.scss', '!node_modules/**/*.scss'])
        .pipe(sourcemaps.init())
        .pipe(sass(sassOptions).on('error', sass.logError))
        .pipe(autoprefixer(autoprefixerOptions))
        .pipe(sourcemaps.write('maps'))
        .pipe(gulp.dest('.'));
});

gulp.task('default', ['js', 'scss']);
