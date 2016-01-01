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
var modify = require('gulp-modify');
var querystring = require('querystring');
var gulpFilter = require('gulp-filter');
var sourcemaps = require('gulp-sourcemaps');
var lzstring = require("./lzstring");

var project = args.project;
if (!project) {
    throw new Error("A project is required to build, use --project <project name> to specify the project");
}

var paths = {
  scripts: ['base/**/*.ts', 'visuals/' + project + '/**/*.ts', 'base/**/*.js', 'visuals/' + project + '/**/*.js'],
  styles: ['base/**/*.css', 'visuals/' + project + '/**/*.css'],
  buildDir: 'build/' + project,
  buildJS: ['build/' + project + '/**/*.js'],
  buildTS: ['build/' + project + '/typescripts.ts', 'build/' + project + '/javascripts.ts'],
  buildCSS: ['build/' + project + '/**/*.css'],
  packageDir: ['package'],
  buildPackageDir: 'build/' + project + '/package'
};

var projectConfig = JSON.parse(fs.readFileSync('visuals/' + project + '/visualconfig.json').toString());

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
	var jsFilter = gulpFilter('**/*.js', {restore: true});
	var tsFilter = gulpFilter('**/*.ts', {restore: true});

    var css = fs.readFileSync(paths.buildDir + "/project.css");
    return gulp.src(paths.scripts)

        /** Javascript processsing */
		.pipe(jsFilter)
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(modify({
            fileModifier: function(file, contents) {
                /**
                 * What the below is doing is basically removing the define/require calls, to remove the AMD load logic from some libraries
                 * and then restoring it after the library is done loading
                 */
                return `
(function() {
    var __w = window,__od=__w["define"], __or=__w["require"];
    __w["require"]=__w["define"]=undefined;
    window["eval"](window["LZString"].decompressFromEncodedURIComponent("${lzstring.compressToEncodedURIComponent(contents)}"));
    __w["define"]=__od;__w["require"]=__or;
})()
                `.trim().replace("\n", "");
            }
        }))
		.pipe(jsFilter.restore)

        /** Typescript processing */
		.pipe(tsFilter)
        .pipe(replace(/\/\*\s*DECLARE_VARS\s*:\s*([\w\,]+)\s*\*\//g, function (substring) {
            return "declare var " + arguments[1].split(",").join(";\ndeclare var ") + ";";
        }))
        .pipe(replace(/\/\/\/\s*<reference.*/g, ''))
        .pipe(replace("\/*INLINE_CSS*\/", css))
		.pipe(tsFilter.restore)

        /* Everytang */
        .pipe(concat('project.ts'))
        .pipe(gulp.dest(paths.buildDir));
});

gulp.task('concat_output', function() {
    return gulp.src(paths.buildTS)
        .pipe(concat('project.ts'))
        .pipe(gulp.dest(paths.buildDir));
});

gulp.task('build:css', function() {
    return gulp.src(paths.styles)
        .pipe(concat('project.css'))
        // .pipe(uglify())
        .pipe(gulp.dest(paths.buildDir));
});

gulp.task('build', function (cb) {
   sequence('clean', 'build:ts', 'concat_output', cb);
});

// The default task (called when you run `gulp` from cli)
/**
 * By default just build the dev build
 */
gulp.task('default', ['tslint', 'build']);

// Took out packaging for now, confusing stuff

// gulp.task('compile:ts', ['build:ts'], function() {
//     var css = fs.readFileSync(paths.buildDir + "/project.css");
//     return gulp.src(paths.scripts)
//         // .pipe(order([
//         //     paths.scripts[0],
//         //     "**/base/**/*.ts",
//         //     "**/" + projectConfig.mainVisual + ".ts"
//         // ]))
//         .pipe(replace("\/*INLINE_CSS*\/", css))
//         .pipe(typescript())
//         .pipe(concat('project.js'))
//         // .pipe(uglify())
//         .pipe(gulp.dest(paths.buildDir));
// });

// gulp.task('package:package_json', function() {
//     return gulp.src([paths.packageDir + "/package.json"])
//         .pipe(replace("%PROJECT_NAME%", projectConfig.mainVisual))
//         .pipe(replace("%PROJECT_ID%", projectConfig.projectId))
//         .pipe(gulp.dest(paths.buildPackageDir));
// });

// gulp.task('package:copy', function() {
//     var final = [].concat(paths.buildJS).concat(paths.buildCSS).concat(paths.buildTS);
//     return gulp.src(final)
//         .pipe(gulp.dest(paths.buildDir + "/package/resources/"));
// });

// gulp.task('package:zip', function() {
//     return gulp.src([paths.buildPackageDir + "/*"])
//         .pipe(zip(projectConfig.mainVisual + ".pbiviz"))
//         .pipe(gulp.dest(paths.buildDir));
// });

// gulp.task('package:clean_build', function() {
//     return del.sync([paths.buildPackageDir]);
// });

// /**
//  * Packages the visualization in a pbiviz
//  */
// gulp.task('package', function(cb) {
//     sequence(['tslint', 'compile:ts'], 'package:package_json', 'package:copy', 'package:zip', 'package:clean_build', cb);
// });

