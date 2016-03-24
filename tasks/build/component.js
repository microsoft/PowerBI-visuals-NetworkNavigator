"use strict";
const fs = require("fs");
const path = require("path");
const webpack = require('gulp-webpack');
const concat = require('gulp-concat');
const sequence = require("gulp-sequence");
const projectConfig = require("../project");

module.exports = function(gulp) {
    const project = projectConfig.name;
    const config = projectConfig.buildConfig; 
    const paths = projectConfig.paths;
    
    /**
     * Builds the bare component
     */
    gulp.task(`build:component`, [`build:css`], function() {
        var output = config.output.component;
        if (output) {
            var webpackConfig = require('../../webpack.config');
            webpackConfig.output = {
                libraryTarget: "umd"
            };
            webpackConfig.entry = path.join(__dirname + "/../../", 'src', output.entry);
            return gulp.src(paths.scripts)
                // .pipe(sourcemaps.init())
                .pipe(webpack(webpackConfig))
                // .pipe(sourcemaps.write())
                .pipe(concat(project + '.js'))
                .pipe(gulp.dest(paths.buildDirComponentJS));
        }
    });
};