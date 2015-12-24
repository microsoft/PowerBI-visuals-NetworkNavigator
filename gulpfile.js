var gulp = require('gulp');
var del = require('del');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var order = require("gulp-order");
var replace = require("gulp-replace");
var fs = require("fs");
var tslint = require('gulp-tslint');
var typescript = require('gulp-typescript');
var sequence = require('gulp-sequence');
var zip = require('gulp-zip');
var args  = require('yargs').argv;

var project = args.project;
if (!project) {
    throw new Error("A project is required to build, use --project <project name> to specify the project");
}

var paths = {
  scripts: ['visuals/' + project + '/**/*.ts', 'base/**/*.ts'],
  styles: ['visuals/' + project + '/**/*.css'],
  buildDir: 'build/' + project,
  buildJS: ['build/' + project + '/**/*.js'],
  buildTS: ['build/' + project + '/**/*.ts'],
  buildCSS: ['build/' + project + '/**/*.css'],
  packageDir: ['package'],
  buildPackageDir: 'build/' + project + '/package'
};

var projectConfig = JSON.parse(fs.readFileSync('visuals/' + project + '/visualconfig.json').toString());

// var projectName = "LineUpVisual";
// var projectId = "1450434005853";

// Not all tasks need to use streams
// A gulpfile is just another node program and you can use any package available on npm
gulp.task('clean', function() {
  // You can use multiple globbing patterns as you would with `gulp.src`
  return del.sync([paths.buildDir]);
});

gulp.task('tslint', function() {
    var toLint = paths.scripts;
    if (projectConfig.lintFiles) {
        toLint = projectConfig.lintFiles.map(function (file) {
           return "visuals/" + project + "/" + file;
        });
    }

    return gulp.src(toLint)
        .pipe(tslint())
        .pipe(tslint.report('verbose'))
});

gulp.task('build:ts', ['build:css'], function() {
    var css = fs.readFileSync(paths.buildDir + "/project.css");
    return gulp.src(paths.scripts)
        .pipe(order([
            paths.scripts[0],
            "**/base/**/*.ts",
            "**/" + projectConfig.mainVisual + ".ts"
        ]))
        .pipe(replace(/\/\/\/\s*<reference.*/g, ''))
        .pipe(replace("\/*INLINE_CSS*\/", css))
        .pipe(concat('project.ts'))
        // .pipe(uglify())
        .pipe(gulp.dest(paths.buildDir));
});

gulp.task('build:js', ['build:ts'], function() {
    var css = fs.readFileSync(paths.buildDir + "/project.css");
    return gulp.src(paths.scripts)
        .pipe(order([
            paths.scripts[0],
            "**/base/**/*.ts",
            "**/" + projectConfig.mainVisual + ".ts"
        ]))
        .pipe(replace("\/*INLINE_CSS*\/", css))
        .pipe(typescript())
        .pipe(concat('project.js'))
        // .pipe(uglify())
        .pipe(gulp.dest(paths.buildDir));
});

gulp.task('build:css', ['clean'], function() {
    return gulp.src(paths.styles)
        .pipe(concat('project.css'))
        // .pipe(uglify())
        .pipe(gulp.dest(paths.buildDir));
});

gulp.task('package:package_json', function() {
    return gulp.src([paths.packageDir + "/package.json"])
        .pipe(replace("%PROJECT_NAME%", projectConfig.mainVisual))
        .pipe(replace("%PROJECT_ID%", projectConfig.projectId))
        .pipe(gulp.dest(paths.buildPackageDir));
});

gulp.task('package:copy', function() {
    var final = [].concat(paths.buildJS).concat(paths.buildCSS).concat(paths.buildTS);
    return gulp.src(final)
        .pipe(gulp.dest(paths.buildDir + "/package/resources/"));
});

gulp.task('package:zip', function() {
    return gulp.src([paths.buildPackageDir + "/*"])
        .pipe(zip(projectConfig.mainVisual + ".pbiviz"))
        .pipe(gulp.dest(paths.buildDir));
});

gulp.task('package:clean_build', function() {
    return del.sync([paths.buildPackageDir]);
});

/**
 * Packages the visualization in a pbiviz
 */
gulp.task('package', function(cb) {
    sequence(['tslint', 'build:js'], 'package:package_json', 'package:copy', 'package:zip', 'package:clean_build', cb);
});

// gulp.task('build', ['']);

// The default task (called when you run `gulp` from cli)
/**
 * By default just build the dev build
 */
gulp.task('default', ['tslint', 'build:ts']);
