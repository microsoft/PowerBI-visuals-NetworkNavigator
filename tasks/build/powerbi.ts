import * as fs from "fs";
import * as path from "path";

var del = require('del');
var zip = require('gulp-zip');
var sequence = require('gulp-sequence');
var gutil = require("gulp-util");
var webpack = require('gulp-webpack');
var replace = require("gulp-replace");
var concat = require('gulp-concat');
var modify = require('gulp-modify');
const projectConfig = require("../project");

/**
 * Defines all of the tasks
 */
module.exports = function (gulp: any) {
    const project = projectConfig.name;
    const config = projectConfig.buildConfig;
    const paths = projectConfig.paths;
    const projectVersion = projectConfig.version;
    const baseDir = __dirname + "/../../";
    const baseBuildName = "build";
    const buildName = "build:powerbi";

    /**
     * Builds the css for the visual
     */
    gulp.task(`${buildName}:package_css`, function() {
        var output = config.output.PowerBI;
        if (output && output.icon) {
            var base64Contents = new Buffer(fs.readFileSync(path.join(paths.projectDir, output.icon), 'binary')).toString('base64');
            var mimeType = "image/png";
            if (output.icon.indexOf(".svg") >= 0) {
                mimeType = "image/svg+xml";
            }

            return string_src('project.css', `
            .visual-icon.${output.visualName + output.projectId}{
                background-image: url(data:${mimeType};base64,${base64Contents});
            }
            `.trim())
                .pipe(gulp.dest(paths.buildDirPowerBiResources));

        }
    });

    /**
     * Builds the scripts for use for with powerbi
     */
    gulp.task(`${buildName}:scripts`, [`${buildName}:package_css`], function() {
        var output = config.output.PowerBI;
        var webpackConfig = require(baseDir + 'webpack.config.powerbi');
        webpackConfig.entry = path.join(baseDir, 'src', output.entry);
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
            .pipe(replace("%PROJECT_DISPLAY_NAME%", output.displayName || output.visualName))
            .pipe(replace("%PROJECT_ID%", output.projectId))
            .pipe(replace("%PROJECT_DESCRIPTION%", output.description))
            .pipe(replace("%PROJECT_VERSION%", projectVersion))
            .pipe(modify({
                fileModifier: function(file: string, contents: string) {
                    var pkg = JSON.parse(contents.toString());
                    if (output.icon) {
                        pkg.images = pkg.images || {};
                        pkg.images.icon = {
                            "resourceId": "rId3"
                        };
                        pkg.resources.push({
                            resourceId: "rId3",
                            sourceType: 3,
                            file: "resources/" + output.icon
                        });
                    }

                    if (output.thumbnail) {
                        pkg.images = pkg.images || {};
                        pkg.images.thumbnail = {
                            "resourceId": "rId4"
                        };
                        pkg.resources.push({
                            resourceId: "rId4",
                            sourceType: 6,
                            file: "resources/" + output.thumbnail
                        });
                    }

                    if (output.screenshot) {
                        pkg.images = pkg.images || {};
                        pkg.images.screenshots = [{
                            "resourceId": "rId5"
                        }];
                        pkg.resources.push({
                            resourceId: "rId5",
                            sourceType: 2,
                            file: "resources/" + output.screenshot
                        });
                    }
                    return JSON.stringify(pkg, null, 4);
                }
            }))
            .pipe(gulp.dest(paths.buildDirPowerBI));
    });

    /**
     * Packages the icon
     */
    gulp.task(`${buildName}:package_images`, function() {
        var output = config.output.PowerBI;
        var imagePaths: string[] = [];
        if (output.icon) {
            imagePaths.push(output.icon);
        }
        if (output.screenshot) {
            imagePaths.push(output.screenshot);
        }
        if (output.thumbnail) {
            imagePaths.push(output.thumbnail);
        }
        return gulp.src(imagePaths.map(function(img) { return paths.projectDir + '/' + img; }))
            .pipe(gulp.dest(paths.buildDirPowerBiResources));
    });

    /**
     * Zips up the visual
     */
    gulp.task(`${buildName}:zip`, function() {
        var output = config.output.PowerBI;
        return gulp.src([paths.buildDirPowerBI + "/**/*"])
            .pipe(zip(`${project}.pbiviz`))
            .pipe(gulp.dest(paths.buildDirPowerBI));
    });

    /**
     * Task to create an empty ts file
     */
    gulp.task(`${buildName}:create_empty_ts`, function(cb: Function) {
        fs.writeFileSync(paths.buildDirPowerBiResources + "/project.ts", "/** See project.js **/");
        cb();
    });

    /**
     * Task to create an empty ts file
     */
    gulp.task(`${buildName}:pre_clean`, function(cb: Function) {
        // You can use multiple globbing patterns as you would with `gulp.src`
        del.sync([paths.buildDirPowerBI]);
        cb();
    });


    /**
     * Task to create an empty ts file
     */
    gulp.task(`${buildName}:post_clean`, function(cb: Function) {
        // You can use multiple globbing patterns as you would with `gulp.src`
        del.sync([paths.buildDirPowerBI + "/css", paths.buildDirPowerBI + "/package.json", paths.buildDirPowerBiResources]);
        cb();
    });

    /**
     * Packages the visualization in a pbiviz
     */
    gulp.task(`${buildName}`, function(cb: Function) {
        sequence(`${buildName}:pre_clean`, `${buildName}:scripts`, `${buildName}:package_json`, `${buildName}:package_images`, `${buildName}:create_empty_ts`, `${buildName}:zip`, `${buildName}:post_clean`, cb);
    });
}

/**
 * Pretty prints a version object in the format: { major: number, minor: number, patch: number }
 */
function prettyPrintVersion(v: { major: string; minor: string; patch: string }) {
    if (v) {
        return `${v.major || "0"}.${v.minor || "0"}.${v.patch || "1"}`;
    }
    return "0.0.1";
}

function string_src(filename: string, string: string) {
  var src = require('stream').Readable({ objectMode: true })
  src._read = function () {
    this.push(new gutil.File({ cwd: "", base: "", path: filename, contents: new Buffer(string) }))
    this.push(null)
  }
  return src;
}
