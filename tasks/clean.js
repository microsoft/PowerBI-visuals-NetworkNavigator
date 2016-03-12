"use strict";
const fs = require("fs");
const del = require("del");
const sequence = require("gulp-sequence");
const projects = require("./projects");

module.exports = function(gulp) {
    projects.forEach(projectConfig => {
        const project = projectConfig.name;
        const config = projectConfig.buildConfig; 
        const paths = projectConfig.paths;
        
        // Not all tasks need to use streams
        // A gulpfile is just another node program and you can use any package available on npm
        gulp.task(`clean:${project}`, function(cb) {
            // You can use multiple globbing patterns as you would with `gulp.src`
            del.sync([paths.buildDir]);
            cb();
        });
    });
    
    gulp.task("clean", function(cb) {
        return sequence.apply(this, [projects.map(n => `clean:${n.name}`)].concat(cb));
    });
};