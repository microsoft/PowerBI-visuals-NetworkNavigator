"use strict";
const fs = require("fs");
const path = require("path");
const webpack = require('gulp-webpack');
const concat = require('gulp-concat');
const sequence = require("gulp-sequence");
const sass = require("gulp-sass");
const projectConfig = require("../project");

module.exports =function(gulp) {
    const project = projectConfig.name;
    const config = projectConfig.buildConfig; 
    const paths = projectConfig.paths;
    
    /**
     * Builds the css
     */
    gulp.task(`build:react:css`, function() {
        var output = config.output.react;
        if (output) {
            return gulp.src(paths.styles)
                .pipe(sass())
                .pipe(gulp.dest(paths.buildDirReactCSS));
        }
    });

    /**
     * Builds the react component
     */
    gulp.task(`build:react`, [`build:react:css`], function() {
        var output = config.output.react;
        if (output) {
            var webpackConfig = require('../../webpack.config');
            webpackConfig.output = {
                libraryTarget: "umd"
            };
            webpackConfig.entry = path.join(__dirname + "/../../", "src", output.entry);
            return gulp.src([webpackConfig.entry])
                // .pipe(sourcemaps.init())
                .pipe(webpack(webpackConfig))
                // .pipe(sourcemaps.write())
                .pipe(concat(project + '.js'))
                .pipe(gulp.dest(paths.buildDirReactJS));
        }
    });
};