"use strict";
const fs = require("fs");
const baseDir = __dirname + "/../../";
const sequence = require("gulp-sequence");
const sass = require("gulp-sass");
const projectConfig = require("../project")
const webpack = require('gulp-webpack');;
const path = require("path");
const concat = require('gulp-concat');

module.exports = function(gulp) {
    require("./powerbi")(gulp);

    const project = projectConfig.name;
    const config = projectConfig.buildConfig;
    const paths = projectConfig.paths;
    const componentTypes =
        Object.keys(projectConfig.buildConfig.output)
            .filter(n => n !== "lintFiles" && n !== "options" && n !== "version");
    const componentBuildCommands =
        componentTypes.map(n => `build:${n.toLowerCase()}`);

    componentTypes.forEach(n => {
        const normalizedType = n.toLocaleLowerCase();
        const buildDir = paths.getBuildDir(normalizedType);

        /**
         * Builds the css
         */
        gulp.task(`build:${normalizedType}:css`, function() {
            return gulp.src(paths.styles)
                .pipe(sass())
                .pipe(gulp.dest(buildDir));
        });

        if (normalizedType !== "powerbi") {

            /**
             * Builds the react component
             */
            gulp.task(`build:${normalizedType}`, [`build:${normalizedType}:css`], function() {
                const output = config.output[n];

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
                    .pipe(gulp.dest(buildDir));
            });
        }
    });
    const buildDir = paths.getBuildDir()

    /**
     * Build task for a given component
     */
    gulp.task(`build`, function(callback) {
        var toBuild = [];
        toBuild.push(`clean`);
        Array.prototype.push.apply(toBuild, componentBuildCommands);
        return sequence.apply(this, toBuild.concat(callback));
    });
};
