"use strict";
var del = require("del");
var sequence = require("gulp-sequence");
var projectConfig = require("./project");
module.exports = function (gulp) {
    var project = projectConfig.name;
    var config = projectConfig.buildConfig;
    var paths = projectConfig.paths;
    gulp.task("clean", function (cb) {
        del.sync([paths.buildDir]);
        cb();
    });
};
