"use strict";
var del = require('del');
var fs = require("fs");
var typescript = require('gulp-typescript');
var zip = require('gulp-zip');
var sequence = require('gulp-sequence');
var path = require("path");
var gutil = require("gulp-util");
var webpack = require('gulp-webpack');
var replace = require("gulp-replace");
var concat = require('gulp-concat');
var modify = require('gulp-modify');
const projects = require("../projects");

/**
 * Defines all of the tasks
 */
module.exports = function (gulp) {
    projects.forEach(projectConfig => {
        const project = projectConfig.name;
        const config = projectConfig.buildConfig; 
        const paths = projectConfig.paths;
        const baseDir = __dirname + "/../../";
        const baseBuildName = "build:" + project;
        const buildName = "build:" + project + ":powerbi";
        
        /**
         * Builds the css for the visual
         */
        gulp.task(`${buildName}:css`, [`${buildName}:css`], function() {
            var output = config.output.PowerBI;
            if (output && output.icon) {
                var base64Contents = new Buffer(fs.readFileSync(paths.projectDir + '/' + output.icon), 'binary').toString('base64');
                return string_src('project.css', `
                .visual-icon.${output.visualName + output.projectId}{
                    background-image: url(data:image/png;base64,${base64Contents});
                }
                `.trim())
                    .pipe(gulp.dest(paths.buildDirPowerBiResources));

            }
        });

        /**
         * Builds the scripts for use for with powerbi
         */
        gulp.task(`${buildName}:scripts`, [`build:${project}:css`, `compile:${project}:ts`], function() {
            var output = config.output.PowerBI;
            var webpackConfig = require(baseDir + 'webpack.config.dev.js');
            webpackConfig.entry = path.join(baseDir, 'visuals', project, output.entry);
            return gulp.src(paths.scripts)
                .pipe(webpack(webpackConfig))
                // .pipe(sourcemaps.write())
                .pipe(concat('project.js'))
                .pipe(gulp.dest(paths.buildDirPowerBiResources));
        });

        /**
         * Creates the package.json
         */
        gulp.task(`${buildName}:package_json`, function() {
            var output = config.output.PowerBI;
            return gulp.src([paths.packageDir + "/package.json"])
                .pipe(replace("%PROJECT_NAME%", output.visualName))
                .pipe(replace("%PROJECT_ID%", output.projectId))
                .pipe(modify({
                    fileModifier: function(file, contents) {
                        if (output.icon) {
                            var pkg = JSON.parse(contents.toString());
                            pkg.images = {
                                icon: {
                                    "resourceId": "rId3"
                                }
                            };
                            pkg.resources.push({
                                resourceId: "rId3",
                                sourceType: 3,
                                file: "resources/" + output.icon
                            });
                            var uniqueProjName = output.visualName + output.projectId;
                            /**
                             * What the below is doing is basically removing the define/require calls, to remove the AMD load logic from some libraries
                             * and then restoring it after the library is done loading
                             */
                            return JSON.stringify(pkg, null, 4);
                        }
                        return `${contents}`.trim().replace("\n", "");
                    }
                }))
                .pipe(gulp.dest(paths.buildDirPowerBI));
        });

        /**
         * Packages the icon
         */
        gulp.task(`${buildName}:package_icon`, function() {
            var output = config.output.PowerBI;
            if (output.icon) {
                return gulp.src([paths.projectDir + '/' + output.icon])
                    .pipe(gulp.dest(paths.buildDirPowerBiResources));
            }
        });

        /**
         * Zips up the visual
         */
        gulp.task(`${buildName}:zip`, function() {
            var output = config.output.PowerBI;
            return gulp.src([paths.buildDirPowerBI + "/**/*"])
                .pipe(zip(output.visualName + ".pbiviz"))
                .pipe(gulp.dest(paths.buildDirPowerBI));
        });

        /**
         * Task to create an empty ts file
         */
        gulp.task(`${buildName}:create_empty_ts`, function(cb) {
            fs.writeFileSync(paths.buildDirPowerBiResources + "/project.ts", "/** See project.js **/");
            cb();
        });

        /**
         * Task to create an empty ts file
         */
        gulp.task(`${buildName}:pre_clean`, function(cb) {
            // You can use multiple globbing patterns as you would with `gulp.src`
            del.sync([paths.buildDirPowerBI]);
            cb();
        });


        /**
         * Task to create an empty ts file
         */
        gulp.task(`${buildName}:post_clean`, function(cb) {
            // You can use multiple globbing patterns as you would with `gulp.src`
            del.sync([paths.buildDirPowerBI + "/package.json", paths.buildDirPowerBiResources]);
            cb();
        });

        /**
         * Packages the visualization in a pbiviz
         */
        gulp.task(`${buildName}`, function(cb) {
            sequence(`${buildName}:pre_clean`, `${buildName}:scripts`, `${buildName}:package_json`, `${buildName}:package_icon`, `${buildName}:create_empty_ts`, `${buildName}:zip`, `${buildName}:post_clean`, cb);
        });
    });
}

function string_src(filename, string) {
  var src = require('stream').Readable({ objectMode: true })
  src._read = function () {
    this.push(new gutil.File({ cwd: "", base: "", path: filename, contents: new Buffer(string) }))
    this.push(null)
  }
  return src;
}