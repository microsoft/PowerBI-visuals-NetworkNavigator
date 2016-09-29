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
const sequence = require("gulp-sequence");

module.exports = function(gulp: any) {
    // Run git remote add
    // remote is the remote repo
    // repo is the https url of the repo
    gulp.task('addremote', function(cb: Function){
        git.exec({ args: 'remote -v', quiet: true }, function (err: Error, stdout: string) {
            if (err) throw err;
            if (stdout.toString().indexOf("__upstream") < 0) {
                git.addRemote('__upstream', 'https://msrp.visualstudio.com/DefaultCollection/Essex/_git/EssexPBI', { quiet: true }, function (err: Error) {
                    if (err && err.message.indexOf("upstream already exists") < 0 ) {
                        throw err;
                    }
                    cb();
                });
            } else {
                cb();
            }
        });
    });
    
    /**
     * Syncs this repo with the base project
     */
    gulp.task('sync:fetch_upstream', function(cb: Function) {
        git.fetch('__upstream', 'master', function (err: Error) {
            if (err) throw err;
            cb();
        });
    });
    
    /**
     * Syncs this repo with the base project
     */
    gulp.task('sync:upstream', function(cb: Function) {
        git.merge('__upstream/master', function (err: Error) {
            if (err) throw err;
            cb();
        });
    });
    
    /**
     * Syncs changes
     */
    gulp.task('sync', function(cb: Function){
        return sequence('addremote', 'sync:fetch_upstream', 'sync:upstream', cb);
    });
};