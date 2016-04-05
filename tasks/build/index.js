"use strict";
var path = require("path");
var baseDir = __dirname + "/../../";
var sequence = require("gulp-sequence");
var sass = require("gulp-sass");
var projectConfig = require("../project");
var webpack = require('gulp-webpack');
var concat = require('gulp-concat');
module.exports = function (gulp) {
    require("./powerbi")(gulp);
    var project = projectConfig.name;
    var config = projectConfig.buildConfig;
    var paths = projectConfig.paths;
    var componentTypes = Object.keys(projectConfig.buildConfig.output)
        .filter(function (n) { return n !== "lintFiles" && n !== "options" && n !== "version"; });
    var componentBuildCommands = componentTypes.map(function (n) { return ("build:" + n.toLowerCase()); });
    componentTypes.forEach(function (n) {
        var normalizedType = n.toLocaleLowerCase();
        var buildDir = paths.getBuildDir(normalizedType);
        gulp.task("build:" + normalizedType + ":css", function () {
            return gulp.src(paths.styles)
                .pipe(sass())
                .pipe(gulp.dest(buildDir));
        });
        if (normalizedType !== "powerbi") {
            gulp.task("build:" + normalizedType, [("build:" + normalizedType + ":css")], function () {
                var output = config.output[n];
                var webpackConfig = require('../../webpack.config');
                webpackConfig.output = {
                    libraryTarget: "umd"
                };
                webpackConfig.entry = path.join(__dirname + "/../../", "src", output.entry);
                return gulp.src([webpackConfig.entry])
                    .pipe(webpack(webpackConfig))
                    .pipe(concat(project + '.js'))
                    .pipe(gulp.dest(buildDir));
            });
        }
    });
    var buildDir = paths.getBuildDir();
    gulp.task("build", function (callback) {
        var toBuild = [];
        toBuild.push("clean");
        Array.prototype.push.apply(toBuild, componentBuildCommands);
        return sequence.apply(this, toBuild.concat(callback));
    });
};
