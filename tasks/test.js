"use strict";
const fs = require("fs");
const del = require("del");
const sequence = require("gulp-sequence");
const mocha = require('gulp-mocha');
const projects = require("./projects");

module.exports = function(gulp) {
    projects.forEach((projectConfig) => {
        const project = projectConfig.name;
        const paths = projectConfig.paths;
        
        // Not all tasks need to use streams
        // A gulpfile is just another node program and you can use any package available on npm
        gulp.task(`test:${project}`, function() {
            return gulp.src(paths.test)
                .pipe(mocha({ reporter: 'nyan' }));
        });
            
        /**
         * Starts the test:watch
         */
        gulp.task(`test:${project}:watch`, function(cb) {
            gulp.watch([paths.scripts, paths.test], [`test:${project}`]);
        });
    });

    gulp.task("test", function(cb) {
        return sequence.apply(this, [projects.map(n => `test:${n.name}`)].concat(cb));
    });
};