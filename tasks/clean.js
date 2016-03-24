"use strict";
const fs = require("fs");
const del = require("del");
const sequence = require("gulp-sequence");
const projectConfig = require("./project");

module.exports = function(gulp) {
    const project = projectConfig.name;
    const config = projectConfig.buildConfig; 
    const paths = projectConfig.paths;
    
    // Not all tasks need to use streams
    // A gulpfile is just another node program and you can use any package available on npm
    gulp.task(`clean`, function(cb) {
        // You can use multiple globbing patterns as you would with `gulp.src`
        del.sync([paths.buildDir]);
        cb();
    });
};