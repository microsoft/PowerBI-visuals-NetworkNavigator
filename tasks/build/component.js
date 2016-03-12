"use strict";
const fs = require("fs");
const path = require("path");
const webpack = require('gulp-webpack');
const concat = require('gulp-concat');
const sequence = require("gulp-sequence");
const projects = require("../projects");

module.exports =function(gulp) {
    projects.forEach((projectConfig) => {
        const project = projectConfig.name;
        const config = projectConfig.buildConfig; 
        const paths = projectConfig.paths;
        
        /**
         * Builds the bare component
         */
        gulp.task(`build:${project}:component`, [`build:${project}:css`, `compile:${project}:ts`], function() {
            var output = config.output.component;
            if (output) {
                var webpackConfig = require('../../webpack.config.dev.js');
                webpackConfig.output = {
                    libraryTarget: "umd"
                };
                webpackConfig.entry = path.join(__dirname + "/../../", 'visuals', project, output.entry);
                return gulp.src(paths.scripts)
                    // .pipe(sourcemaps.init())
                    .pipe(webpack(webpackConfig))
                    // .pipe(sourcemaps.write())
                    .pipe(concat(project + '.js'))
                    .pipe(gulp.dest(paths.buildDirComponentJS));
            }
        });
    });
    
    gulp.task("build:component", function(callback) {
        return sequence.apply(this, [projects.map(n => `build:${n.name}:component`)].concat(callback));
    });
};