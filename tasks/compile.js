"use strict";
const fs = require("fs");
const sass = require("gulp-sass");
const baseDir = __dirname + "/../../";
const exec = require('child_process').exec;
const gutil = require("gulp-util");
const projectConfig = require("./project");

module.exports = function(gulp) {
    /**
     * Straight compiles the ts files
     */
    gulp.task(`compile:ts`, function(cb) {
        exec(__dirname + '/../node_modules/typescript/bin/tsc', { cwd: __dirname + "/../" }, function (err, stdout, stderr) {
            if (err) {
                gutil.log(gutil.colors.yellow('\nTypeScript Compilation Issues:\n'), gutil.colors.yellow(stdout));
            }
            cb(err);
        });
    });
};