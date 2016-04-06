"use strict";
import * as fs from "fs";

// dependencies
const gulp = require('gulp');
const git = require('gulp-git');
const sequence = require("gulp-sequence");

module.exports = function(gulp) {
    // Run git remote add
    // remote is the remote repo
    // repo is the https url of the repo
    gulp.task('addremote', function(cb){
        git.exec({ args: 'remote -v', quiet: true }, function (err, stdout) {
            if (err) throw err;
            if (stdout.toString().indexOf("__upstream") < 0) {
                git.addRemote('__upstream', 'https://msrp.visualstudio.com/DefaultCollection/Essex/_git/EssexPBI', { quiet: true }, function (err) {
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
    gulp.task('sync:upstream', function(cb) {
        git.pull('__upstream', 'master', {args: '--rebase'}, function (err) {
            if (err) throw err;
            cb();
        });
    })
    
    /**
     * Syncs changes
     */
    gulp.task('sync', function(cb){
        return sequence('addremote', 'sync:upstream', cb);
    });
};