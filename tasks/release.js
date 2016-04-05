"use strict";
var fs = require("fs");
var gulp = require('gulp');
var git = require('gulp-git');
var bump = require('gulp-bump');
var filter = require('gulp-filter');
var tag_version = require('gulp-tag-version');
var sequence = require("gulp-sequence");
var projectConfig = require("./project");
var addsrc = require("gulp-add-src");
module.exports = function (gulp) {
    var project = projectConfig.name;
    var config = projectConfig.buildConfig;
    var paths = projectConfig.paths;
    function inc(importance) {
        var newVer = config.version;
        newVer[importance] = (parseInt(newVer[importance], 10) + 1) + "";
        var prettyPrinted = JSON.stringify(config, null, 4);
        fs.writeFileSync(paths.projectDir + "/build.json", prettyPrinted);
        return gulp.src(['./package.json'])
            .pipe(bump({ type: importance }))
            .pipe(gulp.dest('./'));
    }
    function release(importance, cb) {
        process.env.BUILD_TARGET = "release";
        return sequence("bump:" + importance, "build", "commit_artifacts", "tag", cb);
    }
    gulp.task("bump:patch", function () {
        return inc('patch');
    });
    gulp.task("bump:minor", function () {
        return inc('minor');
    });
    gulp.task("bump:major", function () {
        return inc('major');
    });
    gulp.task("commit_artifacts", function () {
        return gulp.src([paths.buildArtifacts, paths.projectDir + "/build.js", "package.json"])
            .pipe(git.add())
            .pipe(git.commit('Updating Artifacts'));
    });
    gulp.task("tag", function () {
        return gulp.src(['./package.json'])
            .pipe(tag_version());
        ;
    });
    gulp.task("release_build", function (cb) {
        process.env.BUILD_TARGET = "release";
        return sequence("build", cb);
    });
    gulp.task("release:patch", function (cb) {
        return release("patch", cb);
    });
    gulp.task("release:minor", function (cb) {
        return release("minor", cb);
    });
    gulp.task("release:major", function (cb) {
        return release("major", cb);
    });
};
