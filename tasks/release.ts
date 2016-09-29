/*
 * Copyright (c) Microsoft
 * All rights reserved.
 * MIT License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

"use strict";
import * as fs from "fs";

// dependencies
const gulp = require('gulp');
const git = require('gulp-git');
const bump = require('gulp-bump');
const filter = require('gulp-filter');
const tag_version = require('gulp-tag-version');
const sequence = require("gulp-sequence");
const projectConfig = require("./project");
const addsrc = require("gulp-add-src");

module.exports = function(gulp: any) {
    const project = projectConfig.name;
    const config = projectConfig.buildConfig;
    const paths = projectConfig.paths;

    function inc(importance: string) {
        // get all the files to bump version in
        return gulp.src(['./package.json'])
            // bump the version number in those files
            .pipe(bump({type: importance}))
            // save it back to filesystem
            .pipe(gulp.dest('./'));
    }

    function release(importance: string, cb: Function) {
        process.env.BUILD_TARGET = "release";
        return sequence(`bump:${importance}`, `build`, `commit_artifacts`, `tag`, cb);
    }

    /**
     * Bumps the version of the project
     */
    gulp.task(`bump:patch`, function() {
        return inc('patch');
    });

    /**
     * Bumps the version of the project
     */
    gulp.task(`bump:minor`, function() {
        return inc('minor');
    });

    /**
     * Bumps the version of the project
     */
    gulp.task(`bump:major`, function() {
        return inc('major');
    });

    /**
     * Commits the dist of the given project
     */
    gulp.task(`commit_artifacts`, function() {
        return gulp.src([paths.buildArtifacts, paths.projectDir + "/build.js", "package.json"])
            .pipe(git.add({ args: "-f" }))

            // Add the build artifacts
            .pipe(git.commit('Updating Artifacts'));
    });

    /**
     * Tags the dist of the given project
     */
    gulp.task(`tag`, function() {
        return gulp.src(['./package.json'])
            // **tag it in the repository**
            .pipe(tag_version());;
    });
};
