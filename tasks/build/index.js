"use strict";
const fs = require("fs");
const baseDir = __dirname + "/../../";
const sequence = require("gulp-sequence");
const sass = require("gulp-sass");
const projectConfig = require("../project");

module.exports = function(gulp) {
    require("./powerbi")(gulp);
    require("./component")(gulp);
    require("./react")(gulp);
    
    const project = projectConfig.name;
    const config = projectConfig.buildConfig; 
    const paths = projectConfig.paths;
    
    /**
     * Builds the css
     */
    gulp.task(`build:css`, function() {
        return gulp.src(paths.styles)
            .pipe(sass())
            .pipe(gulp.dest(paths.buildDirComponentCSS));
    });
    
    /**
     * Build task for a given component
     */
    gulp.task(`build`, function(callback) {
        var toBuild = [];
        
        toBuild.push(`clean`);
        
        if (config.output.PowerBI) {
            toBuild.push(`build:powerbi`);
        }
        if (config.output.component) {
            toBuild.push(`build:component`);
        }
        if (config.output.react) {
            toBuild.push(`build:react`);
        }
        toBuild.push(`test`);
        
        return sequence.apply(this, toBuild.concat(callback));
    });
};