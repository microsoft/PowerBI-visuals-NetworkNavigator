var gulp = require('gulp');
var del = require('del');
var concat = require('gulp-concat');
var fs = require("fs");
var tslint = require('gulp-tslint');
var typescript = require('gulp-typescript');
var sequence = require('gulp-sequence');
var zip = require('gulp-zip');
var args = require('yargs').argv;
var modify = require('gulp-modify');
var sourcemaps = require('gulp-sourcemaps');
var webpack = require('gulp-webpack');
var path = require("path");
var replace = require("gulp-replace");
var gutil = require("gulp-util");

var project = args.project;
if (!project) {
    throw new Error("A project is required to build, use --project <project name> to specify the project");
}

var paths = {
    projectDir: 'visuals/' + project,
    scripts: ['visuals/' + project + '/**/*.ts'],
    buildDir: 'build/' + project,
    buildResourcesDir: 'build/' + project + '/resources',
    packageDir: ['package']
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
        toLint = projectConfig.lintFiles.map(function(file) {
            return "visuals/" + project + "/" + file;
        });
    }
    return gulp.src(toLint)
        .pipe(tslint())
        .pipe(tslint.report('verbose'))
});

gulp.task('build:css', function() {
    if (projectConfig.icon) {
        var base64Contents = new Buffer(fs.readFileSync(paths.projectDir + '/' + projectConfig.icon), 'binary').toString('base64');
        return string_src('project.css', `
        .visual-icon.${projectConfig.mainVisual + projectConfig.projectId}{
            background-image: url(data:image/png;base64,${base64Contents});
        }
        `.trim())
            .pipe(gulp.dest(paths.buildResourcesDir));

    }
});

gulp.task('build:ts', ['build:css'], function() {
    var config = require('./webpack.config.dev.js');
    config.entry = path.join(__dirname, 'visuals', project);
    return gulp.src(paths.scripts)
        // .pipe(sourcemaps.init())
        .pipe(webpack(config))
        // .pipe(sourcemaps.write())
        .pipe(concat('project.js'))
        .pipe(gulp.dest(paths.buildResourcesDir));
});

gulp.task('build', function(cb) {
    sequence('clean', 'build:ts', cb);
});

// The default task (called when you run `gulp` from cli)
/**
 * By default just build the dev build
 */
gulp.task('default', ['tslint', 'build']);

gulp.task('package:package_json', function() {
    return gulp.src([paths.packageDir + "/package.json"])
        .pipe(replace("%PROJECT_NAME%", projectConfig.mainVisual))
        .pipe(replace("%PROJECT_ID%", projectConfig.projectId))
        .pipe(modify({
            fileModifier: function(file, contents) {
                if (projectConfig.icon) {
                    var package = JSON.parse(contents.toString());
                    package.images = {
                        icon: {
                            "resourceId": "rId3"
                        }
                    };
                    package.resources.push({
                        resourceId: "rId3",
                        sourceType: 3,
                        file: "resources/" + projectConfig.icon
                    });
                    var uniqueProjName = projectConfig.mainVisual + projectConfig.projectId;
                    /**
                     * What the below is doing is basically removing the define/require calls, to remove the AMD load logic from some libraries
                     * and then restoring it after the library is done loading
                     */
                    return JSON.stringify(package, null, 4);
                }
                return `${contents}`.trim().replace("\n", "");
            }
        }))
        .pipe(gulp.dest(paths.buildDir));
});

gulp.task('package:package_icon', function() {
    if (projectConfig.icon) {
        return gulp.src([paths.projectDir + '/' + projectConfig.icon])
            .pipe(gulp.dest(paths.buildResourcesDir));
    }
});

gulp.task('package:zip', function() {
    return gulp.src([paths.buildDir + "/**/*"])
        .pipe(zip(projectConfig.mainVisual + ".pbiviz"))
        .pipe(gulp.dest(paths.buildDir));
});

/**
 * Task to create an empty ts file
 */
gulp.task('package:create_empty_ts', function(cb) {
    fs.writeFileSync(paths.buildResourcesDir + "/project.ts", "/** See project.js **/");
    cb();
});

/**
 * Packages the visualization in a pbiviz
 */
gulp.task('package', function(cb) {
    sequence('build', 'package:package_json', 'package:package_icon', 'package:create_empty_ts', 'package:zip', cb);
});

function string_src(filename, string) {
  var src = require('stream').Readable({ objectMode: true })
  src._read = function () {
    this.push(new gutil.File({ cwd: "", base: "", path: filename, contents: new Buffer(string) }))
    this.push(null)
  }
  return src
}