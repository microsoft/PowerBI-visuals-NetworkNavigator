"use strict";
const fs = require("fs");
const paths = require("./paths");
const sass = require("gulp-sass");
const baseDir = __dirname + "/../../";
const exec = require('child_process').exec;
const gutil = require("gulp-util");
const sequence = require("gulp-sequence");
const webserver = require('gulp-webserver');
const projects = require("./projects");

module.exports = function(gulp) {
    projects.forEach(projectConfig => {
        const project = projectConfig.name;
        const paths = projectConfig.paths;
        
        /**
         * Starts the demo
         */
        gulp.task(`demo:${project}`, function(cb) {
            gulp.watch([paths.scripts, paths.styles], [`build:${project}:component`]);
            sequence(`clean:${project}`, `build:${project}:component`, 'demo-server', cb);
        });
    });
    
    let allPaths = paths("*");
    
    /**
     * Starts the demo server
     */
    gulp.task('demo-server', function() {
        gulp.src('./')
            .pipe(webserver({
                livereload: {
                    enable: true, // need this set to true to enable livereload
                    filter: function(fileName) {
                        // This has to match both folders and file names, otherwise it doesn't do anything
                        // if (fileName.match(/dist$/) || fileName.match(/dist[^\.]+$/) || /*fileName.match(/dist.*\.js$/)*/
                        //     fileName.match(/demo/) || fileName.match(/demo[^\.]+$/)/* || fileName.match(/demo.*\.js$/)*/) {
                        //     return true;
                        // }
                        if (fileName.match(/dist.*/) || fileName.match(/demo.*/)) {
                            return true;
                        }
                        // if ((fileName.match(/demo\//) || fileName.match(/dist\//)) && fileName.match(/\.js$/)) {
                        //     console.log(fileName);
                        //     return true;
                        // }
                        return false;
                    }
                },
                open: '/demo'
            }));
    });

    /**
     * Starts the demo
     */
    gulp.task('demo', function(cb) {
        gulp.watch([allPaths.scripts, allPaths.styles], ['build:component']);
        sequence('clean', 'build:component', 'demo-server', cb);
    });
};