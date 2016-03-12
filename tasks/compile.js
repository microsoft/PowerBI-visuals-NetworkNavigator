"use strict";
const fs = require("fs");
const paths = require("./paths");
const sass = require("gulp-sass");
const baseDir = __dirname + "/../../";
const exec = require('child_process').exec;
const gutil = require("gulp-util");

module.exports = function(gulp) {
    let projects = fs.readdirSync('visuals').filter(n => /^[\w|_]+$/.test(n));
    projects.forEach((project) => {
        /**
         * Straight compiles the ts files
         */
        gulp.task(`compile:${project}:ts`, function(cb) {
            exec(__dirname + '/../node_modules/typescript/bin/tsc', { cwd: __dirname + "/../" }, function (err, stdout, stderr) {
                if (err) {
                    gutil.log(gutil.colors.yellow('\nTypeScript Compilation Issues:\n'), gutil.colors.yellow(stdout));
                }
                cb(err);
            });
        });
    });
};