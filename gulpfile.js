var gulp = require('gulp');
var del = require('del');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var order = require("gulp-order");
var replace = require("gulp-replace");
var fs = require("fs");
var tslint = require('gulp-tslint');

var paths = {
  scripts: ['src/**/*.ts'],
  styles: ['src/**/*.css'],
  buildDir: 'build'
};

var projectName = "GraphVisual";

// Not all tasks need to use streams
// A gulpfile is just another node program and you can use any package available on npm
gulp.task('clean', function() {
  // You can use multiple globbing patterns as you would with `gulp.src`
  return del.sync([paths.buildDir]);
});

gulp.task('tslint', function() {
    return gulp.src(paths.scripts)
        .pipe(tslint())
        .pipe(tslint.report('verbose'))
});

gulp.task('build:js', ['build:css'], function() {
    var css = fs.readFileSync(paths.buildDir + "/project.css");
    return gulp.src(paths.scripts)
        .pipe(order([
            paths.scripts[0],
            "**/VisualBase.ts",
            "**/" + projectName + ".ts"
        ]))
        .pipe(replace(/\/\/\/\s*<reference.*/g, ''))
        .pipe(replace("\/*INLINE_CSS*\/", css))
        .pipe(concat('project.ts'))
        // .pipe(uglify())
        .pipe(gulp.dest(paths.buildDir));
});

gulp.task('build:css', ['clean'], function() {
    return gulp.src(paths.styles)
        .pipe(concat('project.css'))
        // .pipe(uglify())
        .pipe(gulp.dest(paths.buildDir));
});

// gulp.task('build', ['']);

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['tslint', 'build:js']);
