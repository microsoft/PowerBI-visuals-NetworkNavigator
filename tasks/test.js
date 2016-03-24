"use strict";
const fs = require("fs");
const del = require("del");
const sequence = require("gulp-sequence");
const mocha = require('gulp-mocha');
const projectConfig = require("./project");

module.exports = function(gulp) {
    const project = projectConfig.name;
    const paths = projectConfig.paths;
    
    // Not all tasks need to use streams
    // A gulpfile is just another node program and you can use any package available on npm
    gulp.task(`test`, function() {
        return gulp.src(paths.test)
            .pipe(mocha({ reporter: 'nyan' }));
    });
        
    /**
     * Starts the test:watch
     */
    gulp.task(`test:watch`, function(cb) {
        gulp.watch([paths.scripts, paths.test], [`test`]);
    });
};