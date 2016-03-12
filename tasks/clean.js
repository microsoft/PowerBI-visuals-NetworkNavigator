"use strict";
const pathFactory = require("./paths");
const fs = require("fs");
const del = require("del");
const sequence = require("gulp-sequence");

module.exports = function(gulp) {
    let projects = fs.readdirSync('visuals').filter(n => /^[\w|_]+$/.test(n));
    projects.forEach((project) => {
        const paths = pathFactory(project);
        
        // Not all tasks need to use streams
        // A gulpfile is just another node program and you can use any package available on npm
        gulp.task(`clean:${project}`, function(cb) {
            // You can use multiple globbing patterns as you would with `gulp.src`
            del.sync([paths.buildDir]);
            cb();
        });
    });
    
    gulp.task("clean", function(cb) {
        return sequence.apply(this, [projects.map(n => `clean:${n}`)].concat(cb));
    });
};