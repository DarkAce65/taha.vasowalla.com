const gulp = require('gulp');
const sass = require('gulp-sass');
const bourbon = require('bourbon').includePaths;
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');

const sassOptions = {
    includePaths: ['colors'].concat(bourbon)
};
const autoprefixerOptions = {
    browsers: ['last 2 versions', '> 5%']
};

gulp.task('scss', function () {
    return gulp.src(['**/*.scss', '!node_modules/**/*.scss'])
        .pipe(sourcemaps.init())
        .pipe(sass(sassOptions).on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(autoprefixer(autoprefixerOptions))
        .pipe(gulp.dest(function(file) {
            return file.base;
        }));
});

gulp.task('default', ['scss']);
