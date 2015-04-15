var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    jslint = require('gulp-jslint');

/*****
 * JSHint task, lints the lib and test *.js files.
 *****/
gulp.task('jshint', function () {
    return gulp.src([
        '*.js',
        '*/*.js',
        ])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-summary'));
});

/*****
 * JSHint task, lints the lib and test *.js files.
 *****/
gulp.task('jslint', function () {
    return gulp.src([
        '*.js',
        '*/*.js',
        '*/*/*.js',
        ])
        .pipe(jslint());
});

/*****
 * Base task
 *****/
gulp.task('default', ['jshint', 'jslint']);
