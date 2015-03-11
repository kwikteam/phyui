var gulp = require('gulp'),
    jshint = require('gulp-jshint');


/*****
 * JSHint task, lints the lib and test *.js files.
 *****/
gulp.task('jshint', function () {
    return gulp.src([
        'notebook/js/notebook_session.js',
        'js/manual_clustering.js',
        'gulpfile.js'
        ])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-summary'));
});

/*****
 * Base task
 *****/
gulp.task('default', ['jshint']);
