var gulp = require('gulp');
var del = require('del');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

var paths = {
  scripts: ['src/**/*.ts'],
  styles: ['src/**/*.css'],
  buildDir: 'build'
};

// Not all tasks need to use streams
// A gulpfile is just another node program and you can use any package available on npm
gulp.task('clean', function() {
  // You can use multiple globbing patterns as you would with `gulp.src`
  return del(['build']);
});

gulp.task('build-js', function() {
    return gulp.src(paths.scripts)
        .pipe(concat('project.ts'))
        // .pipe(uglify())
        .pipe(gulp.dest(paths.buildDir));
});

gulp.task('build-css', function() {
    return gulp.src(paths.styles)
        .pipe(concat('project.css'))
        // .pipe(uglify())
        .pipe(gulp.dest(paths.buildDir));
});

gulp.task('build', ['build-js', 'build-css']);

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['clean', 'build']);
